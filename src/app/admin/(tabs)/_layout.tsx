import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../../theme/theme';

const ICONS: Record<string, string> = {
  index: '🗂️',
  doctors: '🩺',
  data: '📊',
  profile: '👤',
};

const TITLES: Record<string, string> = {
  index: 'Content',
  doctors: 'Doctors',
  data: 'Data',
  profile: 'Profile',
};

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        title: TITLES[route.name],
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="doctors" />
      <Tabs.Screen name="data" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
