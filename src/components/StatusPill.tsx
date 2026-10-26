import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { DiaryStatus } from '../types/questionnaire';

const PRESET: Record<DiaryStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: colors.pendingBg, fg: colors.pendingText, label: 'Pending' },
  accepted: { bg: colors.acceptedBg, fg: colors.acceptedText, label: 'Accepted' },
  declined: { bg: '#FBE3E3', fg: colors.danger, label: 'Declined' },
};

export function StatusPill({ status }: { status: DiaryStatus }) {
  const preset = PRESET[status];
  return (
    <View style={[styles.pill, { backgroundColor: preset.bg }]}>
      <Text style={[styles.text, { color: preset.fg }]}>{preset.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  text: { fontSize: 12, fontWeight: '700' },
});
