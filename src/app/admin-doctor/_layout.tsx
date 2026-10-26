import React from 'react';
import { Stack } from 'expo-router';

export default function AdminDoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="doctor-edit" />
      <Stack.Screen name="report" />
      <Stack.Screen name="patient-records" />
    </Stack>
  );
}
