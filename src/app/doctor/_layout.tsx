import React from 'react';
import { Stack } from 'expo-router';

export default function DoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-note" />
      <Stack.Screen name="report" />
    </Stack>
  );
}
