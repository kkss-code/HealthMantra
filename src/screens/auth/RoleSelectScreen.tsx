import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { Logo } from '../../components/Logo';
import { Role } from '../../types/domain';
import { colors, spacing, typography } from '../../theme/theme';

// Admin isn't offered here — those accounts are created directly in Supabase
// and sign in via the plain /login screen, not a public tile.
const ROLES: { role: Role; label: string; description: string; icon: string }[] = [
  { role: 'patient', label: 'Patient', description: 'Log a condition, get a report', icon: '🙂' },
  { role: 'doctor', label: 'Doctor', description: 'Review patient notes', icon: '🧑‍⚕️' },
];

export function RoleSelectScreen() {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Logo size={72} />
        <Text style={typography.h1}>HealthMantra</Text>
        <Text style={typography.bodyMuted}>Continue as</Text>
      </View>

      <View style={styles.grid}>
        {ROLES.map((r) => (
          <Pressable key={r.role} style={styles.cardWrap} onPress={() => router.push({ pathname: '/login', params: { intendedRole: r.role } })}>
            <Card style={styles.card}>
              <Text style={{ fontSize: 28 }}>{r.icon}</Text>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.description}>{r.description}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.lg, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cardWrap: { width: '47%' },
  card: { alignItems: 'center', gap: 4 },
  label: { fontWeight: '700', color: colors.text, fontSize: 15 },
  description: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
