import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../theme/theme';
import { useAuthStore } from '../state/authStore';
import { ROLE_HOME_ROUTE } from '../utils/roleHome';

interface Props {
  title?: string;
  showHome?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, showHome, onBack }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const homeRoute = ROLE_HOME_ROUTE[role ?? 'patient'];

  return (
    <View style={styles.row}>
      <Pressable onPress={onBack ?? (() => router.back())} style={styles.iconBtn} hitSlop={8}>
        <Text style={styles.icon}>←</Text>
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : <View style={{ flex: 1 }} />}
      {showHome ? (
        <Pressable onPress={() => router.navigate(homeRoute as any)} style={styles.iconBtn} hitSlop={8}>
          <Text style={[styles.icon, { color: colors.primary }]}>⌂</Text>
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20, color: colors.text },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: colors.text },
});
