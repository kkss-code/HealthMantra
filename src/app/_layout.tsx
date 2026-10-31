import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../state/authStore';
import { useContentStore } from '../state/contentStore';
import { colors } from '../theme/theme';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const initializing = useAuthStore((s) => s.initializing);
  const user = useAuthStore((s) => s.user);
  const loadContent = useContentStore((s) => s.load);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Conditions/questions are protected by RLS requiring an authenticated
  // session, so this must (re-)run whenever `user` goes from null to signed
  // in — not just once at cold start, which can race ahead of auth on a
  // fresh install with no cached session (the Home screen would otherwise
  // be stuck showing zero conditions forever).
  useEffect(() => {
    if (user) loadContent();
  }, [user, loadContent]);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>

        <Stack.Protected guard={user?.role === 'patient'}>
          <Stack.Screen name="patient" />
        </Stack.Protected>
        <Stack.Protected guard={user?.role === 'doctor'}>
          <Stack.Screen name="doctor" />
        </Stack.Protected>
        <Stack.Protected guard={user?.role === 'admin_patient'}>
          <Stack.Screen name="admin-patient" />
        </Stack.Protected>
        <Stack.Protected guard={user?.role === 'admin_doctor'}>
          <Stack.Screen name="admin-doctor" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
