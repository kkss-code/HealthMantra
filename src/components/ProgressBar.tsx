import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/theme';

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, backgroundColor: colors.border, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: colors.primary },
});
