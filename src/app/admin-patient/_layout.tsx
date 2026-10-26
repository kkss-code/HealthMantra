import React from 'react';
import { Stack } from 'expo-router';

export default function AdminPatientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="condition-edit" />
      <Stack.Screen name="questions-list" />
      <Stack.Screen name="question-edit" />
      <Stack.Screen name="report" />
      <Stack.Screen name="patient-records" />
    </Stack>
  );
}
