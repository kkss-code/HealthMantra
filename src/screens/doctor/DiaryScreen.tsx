import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { PillButton } from '../../components/PillButton';
import { backend } from '../../services/backend';
import { useAuthStore } from '../../state/authStore';
import { DiaryEntry } from '../../types/questionnaire';
import { colors, spacing, typography } from '../../theme/theme';

export function DiaryScreen() {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const load = useCallback(() => {
    if (!user) return;
    backend.listDiaryEntriesForDoctor(user.id).then(setEntries);
  }, [user]);

  useFocusEffect(load);

  async function decide(entry: DiaryEntry, status: 'accepted' | 'declined') {
    await backend.updateDiaryEntryStatus(entry.id, status);
    load();
  }

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Diary</Text>
      <Text style={typography.bodyMuted}>Today</Text>

      {user && !user.specialty ? (
        <Pressable onPress={() => router.push('/doctor/profile')}>
          <Card style={styles.banner}>
            <Text style={styles.bannerTitle}>Set your specialty & price</Text>
            <Text style={typography.bodyMuted}>Patients can&apos;t find you in &ldquo;Find a Doctor&rdquo; until your profile is complete. Tap to finish it.</Text>
          </Card>
        </Pressable>
      ) : null}

      {entries.length === 0 ? (
        <Text style={typography.bodyMuted}>No patients have sent you a note yet.</Text>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id}>
            <Pressable onPress={() => router.push({ pathname: '/doctor/report', params: { entryId: entry.id } })}>
              <View style={styles.row}>
                <Text style={styles.avatar}>🙂</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{entry.patientName}</Text>
                  <Text style={typography.bodyMuted}>
                    {entry.conditionName} — {new Date(entry.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <StatusPill status={entry.status} />
              </View>
            </Pressable>
            {entry.status === 'pending' ? (
              <View style={styles.actions}>
                <PillButton label="Decline" variant="secondary" onPress={() => decide(entry, 'declined')} />
                <PillButton label="Confirm" onPress={() => decide(entry, 'accepted')} />
              </View>
            ) : null}
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { fontSize: 28 },
  name: { fontWeight: '700', color: colors.text },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
  banner: { gap: 4, backgroundColor: colors.primaryLight, borderColor: colors.primary },
  bannerTitle: { fontWeight: '700', color: colors.text },
});
