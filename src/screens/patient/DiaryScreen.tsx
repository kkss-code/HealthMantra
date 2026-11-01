import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { TextField } from '../../components/TextField';
import { useAuthStore } from '../../state/authStore';
import { useContentStore } from '../../state/contentStore';
import { backend } from '../../services/backend';
import { DiaryEntry } from '../../types/questionnaire';
import { colors, spacing, typography } from '../../theme/theme';

export function DiaryScreen() {
  const user = useAuthStore((s) => s.user);
  const conditions = useContentStore((s) => s.conditions);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      backend.listDiaryEntriesForPatient(user.id).then(setEntries);
    }, [user])
  );

  const visible = entries.filter((e) => e.conditionName.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenContainer>
      <Text style={typography.h1}>My Diary</Text>
      <Text style={typography.bodyMuted}>Every note you&apos;ve logged, in one place.</Text>

      <TextField placeholder="Search" value={search} onChangeText={setSearch} />

      {entries.length === 0 ? (
        <Text style={typography.bodyMuted}>No entries yet. Use &ldquo;Our Services&rdquo; to log your first note.</Text>
      ) : visible.length === 0 ? (
        <Text style={typography.bodyMuted}>No entries match your search.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {visible.map((entry) => (
            <Pressable key={entry.id} onPress={() => router.push({ pathname: '/patient/report', params: { entryId: entry.id } })}>
              <Card style={styles.row}>
                <Text style={styles.date}>
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                </Text>
                <Text style={{ fontSize: 20 }}>{conditions.find((c) => c.id === entry.conditionId)?.icon ?? '🩺'}</Text>
                <Text style={styles.label}>{entry.conditionName}</Text>
                <StatusPill status={entry.status} />
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { fontSize: 12, fontWeight: '700', color: colors.primary, width: 44 },
  label: { flex: 1, fontWeight: '600', color: colors.text },
});
