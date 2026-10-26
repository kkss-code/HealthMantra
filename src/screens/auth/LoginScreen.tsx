import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { Logo } from '../../components/Logo';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { useAuthStore } from '../../state/authStore';
import { Role, ROLE_LABELS } from '../../types/domain';
import { ROLE_HOME_ROUTE } from '../../utils/roleHome';
import { colors, spacing, typography } from '../../theme/theme';

export function LoginScreen() {
  const params = useLocalSearchParams<{ intendedRole?: Role }>();
  const intendedRole = params.intendedRole;
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password, intendedRole);
      const signedInRole = useAuthStore.getState().user?.role;
      if (signedInRole) router.replace(ROLE_HOME_ROUTE[signedInRole] as any);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={intendedRole ? ROLE_LABELS[intendedRole] : undefined} />
      <ScreenContainer>
        <View style={styles.header}>
          <Logo size={88} />
          <Text style={styles.heading}>Proceed with your{'\n'}Login</Text>
        </View>

        <View style={styles.form}>
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
            <View>
              <TextField
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="••••••••"
                style={{ marginTop: spacing.xs }}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                <Text>{showPassword ? '🙈' : '👁️'}</Text>
              </Pressable>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PillButton label="Login" onPress={handleLogin} loading={loading} fullWidth />

          <Pressable onPress={() => router.push({ pathname: '/register', params: intendedRole ? { intendedRole } : {} })}>
            <Text style={styles.link}>Don’t have an account? Register</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 28 },
  form: { gap: spacing.lg, marginTop: spacing.xl },
  eyeBtn: { position: 'absolute', right: spacing.md, top: 0, bottom: 0, justifyContent: 'center' },
  error: { color: colors.danger, fontSize: 13 },
  link: { color: colors.primary, textAlign: 'center', fontWeight: '600', marginTop: spacing.sm },
});
