import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Modal, StyleSheet, Text, View } from 'react-native';
import { PillButton } from './PillButton';
import { colors, radius, spacing } from '../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureDataUri: string) => void;
}

// react-native-signature-canvas (used on native) renders through
// react-native-webview, which has no web implementation at all — opening it
// on web shows "React Native WebView does not support this platform" and
// then just hangs forever, since the native<->webview message bridge the
// library relies on for onOK/readSignature never exists. So on web we skip
// that library entirely and draw straight onto an HTML canvas instead.
export function SignaturePadModal({ visible, onClose, onSave }: Props) {
  if (!visible) return null;
  return <SignatureCanvasSheet onClose={onClose} onSave={onSave} />;
}

function SignatureCanvasSheet({ onClose, onSave }: Omit<Props, 'visible'>) {
  const containerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  function handleLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setSize({ width, height });
  }

  useEffect(() => {
    if (!size) return;
    const node = containerRef.current as HTMLElement | null;
    if (!node) return;

    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    canvas.style.touchAction = 'none';
    node.appendChild(canvas);
    canvasRef.current = canvas;

    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx = rawCtx;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1a1a1a';

    function pointFromEvent(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handlePointerDown(e: PointerEvent) {
      drawingRef.current = true;
      const { x, y } = pointFromEvent(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    function handlePointerMove(e: PointerEvent) {
      if (!drawingRef.current) return;
      const { x, y } = pointFromEvent(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    function handlePointerUp() {
      drawingRef.current = false;
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      node.removeChild(canvas);
      canvasRef.current = null;
    };
  }, [size]);

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function handleDone() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
    onClose();
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Sign here</Text>
          <View ref={containerRef} style={styles.canvasWrap} onLayout={handleLayout} />
          <View style={styles.actions}>
            <PillButton label="Clear" variant="secondary" onPress={handleClear} />
            <PillButton label="Cancel" variant="secondary" onPress={onClose} />
            <PillButton label="Done" onPress={handleDone} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    height: '65%',
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  canvasWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
