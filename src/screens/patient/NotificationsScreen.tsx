import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { useAuthStore } from '../../state/authStore';
import { backend } from '../../services/backend';
import { DiaryEntry } from '../../types/questionnaire';
import { typography } from '../../theme/theme';

export function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      backend.listDiaryEntriesForPatient(user.id).then(setEntries);
    }, [user])
  );

  const pending = entries.filter((e) => e.status === 'pending');
  const resolved = entries.filter((e) => e.status !== 'pending');

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Notifications</Text>

      <Text style={typography.h2}>Pending</Text>
      {pending.length === 0 ? (
        <Text style={typography.bodyMuted}>Nothing waiting on your doctor right now.</Text>
      ) : (
        pending.map((e) => (
          <Card key={e.id}>
            <View style={styles.row}>
              <Text style={styles.title}>{e.conditionName} note submitted</Text>
              <StatusPill status={e.status} />
            </View>
            <Text style={typography.bodyMuted}>{new Date(e.createdAt).toLocaleString()}</Text>
          </Card>
        ))
      )}

      <Text style={[typography.h2, { marginTop: 8 }]}>Updates</Text>
      {resolved.length === 0 ? (
        <Text style={typography.bodyMuted}>No updates yet.</Text>
      ) : (
        resolved.map((e) => (
          <Card key={e.id}>
            <View style={styles.row}>
              <Text style={styles.title}>
                {e.doctorNote?.doctorName ?? 'Your doctor'} reviewed your {e.conditionName} note
              </Text>
              <StatusPill status={e.status} />
            </View>
          </Card>
        ))
      )}

      <Text style={[typography.h2, { marginTop: 8 }]}>No Connected Record</Text>
      <Text style={typography.bodyMuted}>No family or dependent records found.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontWeight: '600' },
});
