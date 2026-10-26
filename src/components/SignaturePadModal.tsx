import React, { useRef } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { PillButton } from './PillButton';
import { colors, radius, spacing } from '../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureDataUri: string) => void;
}

export function SignaturePadModal({ visible, onClose, onSave }: Props) {
  const ref = useRef<SignatureViewRef>(null);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Sign here</Text>
          <View style={styles.canvasWrap}>
            <SignatureScreen
              ref={ref}
              onOK={(signature) => {
                onSave(signature);
                onClose();
              }}
              webStyle="body,html{background:#fff;} .m-signature-pad--footer{display:none;}"
              descriptionText=""
            />
          </View>
          <View style={styles.actions}>
            <PillButton label="Clear" variant="secondary" onPress={() => ref.current?.clearSignature()} />
            <PillButton label="Cancel" variant="secondary" onPress={onClose} />
            <PillButton label="Done" onPress={() => ref.current?.readSignature()} />
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
