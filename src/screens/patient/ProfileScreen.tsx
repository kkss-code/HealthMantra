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
  const [specialty, setSpecialty] = useState(user?.specialty ?? '');
  const [price, setPrice] = useState(user?.price != null ? String(user.price) : '');
  const [saving, setSaving] = useState(false);
  const isDoctor = user?.role === 'doctor';

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        name,
        gender,
        birthdate,
        ...(isDoctor ? { specialty, price: price ? Number(price) : undefined } : {}),
      });
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
        {isDoctor ? <Text style={typography.bodyMuted}>{user.specialty ?? 'Specialty not set'}</Text> : null}
      </View>

      {editing ? (
        <View style={{ gap: spacing.md }}>
          <TextField value={name} onChangeText={setName} placeholder="Name" />
          <TextField value={gender} onChangeText={setGender} placeholder="Gender" />
          <TextField value={birthdate} onChangeText={setBirthdate} placeholder="Birthdate (YYYY-MM-DD)" />
          {isDoctor ? (
            <>
              <TextField value={specialty} onChangeText={setSpecialty} placeholder="Specialty, e.g. Headache" />
              <TextField value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Consult price, e.g. 400" />
            </>
          ) : null}
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
          {isDoctor ? (
            <Card style={styles.infoRow}>
              <Text style={typography.label}>Consult price</Text>
              <Text style={typography.body}>{user.price != null ? `₹${user.price}` : 'Not set'}</Text>
            </Card>
          ) : null}
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
