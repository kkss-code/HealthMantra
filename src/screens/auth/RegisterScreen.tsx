import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { Logo } from '../../components/Logo';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { RadioList } from '../../components/RadioList';
import { useAuthStore } from '../../state/authStore';
import { ROLE_LABELS, Role } from '../../types/domain';
import { ROLE_HOME_ROUTE } from '../../utils/roleHome';
import { colors, spacing, typography } from '../../theme/theme';

const ROLE_OPTIONS: Role[] = ['patient', 'doctor', 'admin_patient', 'admin_doctor'];

export function RegisterScreen() {
  const params = useLocalSearchParams<{ intendedRole?: Role }>();
  const intendedRole = params.intendedRole;
  const signUp = useAuthStore((s) => s.signUp);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(intendedRole ?? 'patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password, role);
      router.replace(ROLE_HOME_ROUTE[role] as any);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar />
      <ScreenContainer>
        <View style={styles.header}>
          <Logo size={72} />
          <Text style={styles.heading}>Create your account</Text>
        </View>

        <View style={styles.form}>
          <View>
            <Text style={typography.label}>Full name</Text>
            <TextField value={name} onChangeText={setName} placeholder="Abhi Saini" style={{ marginTop: spacing.xs }} />
          </View>
          <View>
            <Text style={typography.label}>Email</Text>
            <TextField
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              style={{ marginTop: spacing.xs }}
            />
          </View>
          <View>
            <Text style={typography.label}>Password</Text>
            <TextField value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" style={{ marginTop: spacing.xs }} />
          </View>
          <View>
            <Text style={typography.label}>I am a</Text>
            <View style={{ marginTop: spacing.sm }}>
              <RadioList
                options={ROLE_OPTIONS.map((r) => ROLE_LABELS[r])}
                value={ROLE_LABELS[role]}
                onChange={(label) => setRole(ROLE_OPTIONS.find((r) => ROLE_LABELS[r] === label) ?? 'patient')}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PillButton label="Create account" onPress={handleRegister} loading={loading} fullWidth />

          <Pressable onPress={() => router.push({ pathname: '/login', params: { intendedRole: role } })}>
            <Text style={styles.link}>Already have an account? Login</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text },
  form: { gap: spacing.lg, marginTop: spacing.xl },
  error: { color: colors.danger, fontSize: 13 },
  link: { color: colors.primary, textAlign: 'center', fontWeight: '600', marginTop: spacing.sm },
});
