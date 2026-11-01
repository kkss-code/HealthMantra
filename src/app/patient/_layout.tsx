import React from 'react';
import { Stack } from 'expo-router';

export default function PatientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="condition-intro" />
      <Stack.Screen name="question" />
      <Stack.Screen name="doctor-list" />
      <Stack.Screen name="report" />
      <Stack.Screen name="chat-thread" />
    </Stack>
  );
}
