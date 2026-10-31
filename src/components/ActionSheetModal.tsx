import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PillButton } from './PillButton';
import { colors, radius, spacing } from '../theme/theme';

// RN's Alert.alert with a buttons array is a silent no-op on web (it never
// shows a dialog or calls onPress), so anything gated behind it is unusable
// in the browser. This is a cross-platform replacement built on RN's Modal,
// which does render on web.
export interface ActionSheetAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  actions: ActionSheetAction[];
  onCancel: () => void;
}

export function ActionSheetModal({ visible, title, message, actions, onCancel }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            {actions.map((a) => (
              <PillButton key={a.label} label={a.label} variant={a.variant ?? 'primary'} onPress={a.onPress} fullWidth />
            ))}
            <PillButton label="Cancel" variant="secondary" onPress={onCancel} fullWidth />
          </View>
        </Pressable>
      </Pressable>
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
    gap: spacing.sm,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  message: { fontSize: 13, color: colors.textMuted },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
