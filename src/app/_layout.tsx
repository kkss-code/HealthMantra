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
  const contentLoaded = useContentStore((s) => s.loaded);

  useEffect(() => {
    initialize();
    loadContent();
  }, [initialize, loadContent]);

  if (initializing || !contentLoaded) {
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
