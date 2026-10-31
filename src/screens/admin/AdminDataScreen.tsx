import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { ChipSelect } from '../../components/ChipSelect';
import { backend } from '../../services/backend';
import { AppUser } from '../../types/domain';
import { DiaryEntry } from '../../types/questionnaire';
import { colors, spacing, typography } from '../../theme/theme';

type Section = 'patients' | 'doctors' | 'reports';

const SECTIONS: { value: Section; label: string }[] = [
  { value: 'patients', label: 'Patients' },
  { value: 'doctors', label: 'Doctor Accounts' },
  { value: 'reports', label: 'All Reports' },
];

export function AdminDataScreen() {
  const [section, setSection] = useState<Section>('patients');
  const [patients, setPatients] = useState<AppUser[]>([]);
  const [doctors, setDoctors] = useState<AppUser[]>([]);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      backend.listAccountsByRole('patient').then(setPatients);
      backend.listAccountsByRole('doctor').then(setDoctors);
      backend.listAllDiaryEntries().then(setEntries);
    }, [])
  );

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Data</Text>
      <Text style={typography.bodyMuted}>Everything stored across the app.</Text>

      <ChipSelect options={SECTIONS} value={section} onChange={(v) => setSection(v as Section)} />

      {section === 'patients' ? (
        patients.length === 0 ? (
          <Text style={typography.bodyMuted}>No patient accounts yet.</Text>
        ) : (
          patients.map((p) => (
            <Pressable key={p.id} onPress={() => router.push({ pathname: '/admin/patient-records', params: { patientId: p.id, patientName: p.name } })}>
              <Card style={styles.row}>
                <Text style={{ fontSize: 24 }}>{p.avatarEmoji ?? '🙂'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={typography.bodyMuted}>{p.email}</Text>
                </View>
                <Text style={styles.count}>{entries.filter((e) => e.patientId === p.id).length} note(s)</Text>
              </Card>
            </Pressable>
          ))
        )
      ) : null}

      {section === 'doctors' ? (
        doctors.length === 0 ? (
          <Text style={typography.bodyMuted}>No doctor accounts yet.</Text>
        ) : (
          doctors.map((d) => (
            <Card key={d.id} style={styles.row}>
              <Text style={{ fontSize: 24 }}>{d.avatarEmoji ?? '🧑‍⚕️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{d.name}</Text>
                <Text style={typography.bodyMuted}>
                  {d.email} · {d.specialty ?? 'No specialty'}
                </Text>
              </View>
              {d.price != null ? <Text style={styles.count}>₹{d.price}</Text> : null}
            </Card>
          ))
        )
      ) : null}

      {section === 'reports' ? (
        entries.length === 0 ? (
          <Text style={typography.bodyMuted}>No reports submitted yet.</Text>
        ) : (
          entries.map((e) => (
            <Pressable key={e.id} onPress={() => router.push({ pathname: '/admin/report', params: { entryId: e.id } })}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{e.patientName}</Text>
                  <Text style={typography.bodyMuted}>
                    {e.conditionName} — {new Date(e.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <StatusPill status={e.status} />
              </Card>
            </Pressable>
          ))
        )
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontWeight: '700', color: colors.text },
  count: { fontSize: 12, color: colors.textMuted },
});
