import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { useAuthStore } from '../../state/authStore';
import { colors, radius, spacing, typography } from '../../theme/theme';

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const signOut = useAuthStore((s) => s.signOut);

  async function handleLogout() {
    await signOut();
    router.replace('/');
  }
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [birthdate, setBirthdate] = useState(user?.birthdate ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ name, gender, birthdate });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={typography.h1}>Profile</Text>
        <Pressable onPress={() => setEditing((v) => !v)}>
          <Text style={{ fontSize: 18 }}>{editing ? '✕' : '✏️'}</Text>
        </Pressable>
      </View>

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 40 }}>{user.avatarEmoji ?? '🙂'}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        {user.role === 'doctor' ? <Text style={typography.bodyMuted}>{user.specialty ?? 'Doctor'}</Text> : null}
      </View>

      {editing ? (
        <View style={{ gap: spacing.md }}>
          <TextField value={name} onChangeText={setName} placeholder="Name" />
          <TextField value={gender} onChangeText={setGender} placeholder="Gender" />
          <TextField value={birthdate} onChangeText={setBirthdate} placeholder="Birthdate (YYYY-MM-DD)" />
          <PillButton label="Save" onPress={handleSave} loading={saving} fullWidth />
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Card style={styles.infoRow}>
            <Text style={typography.label}>Email</Text>
            <Text style={typography.body}>{user.email}</Text>
          </Card>
          <Card style={styles.infoRow}>
            <Text style={typography.label}>Gender</Text>
            <Text style={typography.body}>{user.gender ?? 'Not set'}</Text>
          </Card>
          <Card style={styles.infoRow}>
            <Text style={typography.label}>Birthdate</Text>
            <Text style={typography.body}>{user.birthdate ?? 'Not set'}</Text>
          </Card>
        </View>
      )}

      <PillButton label="Logout" variant="danger" onPress={handleLogout} fullWidth />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarWrap: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  infoRow: { gap: 2 },
});
