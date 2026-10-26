import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { backend } from '../../services/backend';
import { useAuthStore } from '../../state/authStore';
import { useContentStore } from '../../state/contentStore';
import { DiaryEntry } from '../../types/questionnaire';
import { reportRoute } from '../../utils/roleHome';
import { colors, spacing, typography } from '../../theme/theme';

export function PatientRecordsScreen() {
  const { patientId, patientName } = useLocalSearchParams<{ patientId: string; patientName: string }>();
  const role = useAuthStore((s) => s.user!.role);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const conditions = useContentStore((s) => s.conditions);

  useEffect(() => {
    backend.listDiaryEntriesForPatient(patientId).then(setEntries);
  }, [patientId]);

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={patientName} />
      <ScreenContainer>
        {entries.length === 0 ? (
          <Text style={typography.bodyMuted}>No notes submitted by this patient yet.</Text>
        ) : (
          entries.map((e) => (
            <Pressable key={e.id} onPress={() => router.push({ pathname: reportRoute(role) as any, params: { entryId: e.id } })}>
              <Card style={styles.row}>
                <Text style={{ fontSize: 22 }}>{conditions.find((c) => c.id === e.conditionId)?.icon ?? '🩺'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{e.conditionName}</Text>
                  <Text style={typography.bodyMuted}>{new Date(e.createdAt).toLocaleDateString()}</Text>
                </View>
                <StatusPill status={e.status} />
              </Card>
            </Pressable>
          ))
        )}
      </ScreenContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontWeight: '700', color: colors.text },
});
