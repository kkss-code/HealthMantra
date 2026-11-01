import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { colors } from '../../../theme/theme';

const ICONS: Record<string, string> = {
  index: '🏠',
  diary: '📔',
  services: '➕',
  chat: '💬',
  notifications: '🔔',
  profile: '👤',
};

const TITLES: Record<string, string> = {
  index: 'Home',
  diary: 'My Diary',
  services: 'Our Services',
  chat: 'Chat',
  notifications: 'Notifications',
  profile: 'Profile',
};

export default function PatientTabsLayout() {
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
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
