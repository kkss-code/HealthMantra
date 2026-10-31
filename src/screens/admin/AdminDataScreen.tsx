import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { ChipSelect } from '../../components/ChipSelect';
import { TextField } from '../../components/TextField';
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
  const [search, setSearch] = useState('');
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

  const query = search.trim().toLowerCase();
  const filteredPatients = useMemo(
    () => (query ? patients.filter((p) => p.name.toLowerCase().includes(query) || p.email.toLowerCase().includes(query)) : patients),
    [patients, query]
  );
  const filteredDoctors = useMemo(
    () =>
      query
        ? doctors.filter((d) => d.name.toLowerCase().includes(query) || d.email.toLowerCase().includes(query) || (d.specialty ?? '').toLowerCase().includes(query))
        : doctors,
    [doctors, query]
  );
  const filteredEntries = useMemo(
    () =>
      query
        ? entries.filter((e) => e.patientName.toLowerCase().includes(query) || e.conditionName.toLowerCase().includes(query) || (e.doctorName ?? '').toLowerCase().includes(query))
        : entries,
    [entries, query]
  );

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Data</Text>
      <Text style={typography.bodyMuted}>Everything stored across the app.</Text>

      <ChipSelect options={SECTIONS} value={section} onChange={(v) => setSection(v as Section)} />
      <TextField
        placeholder={section === 'reports' ? 'Search by patient, condition or doctor' : 'Search by name or email'}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
      />

      {section === 'patients' ? (
        filteredPatients.length === 0 ? (
          <Text style={typography.bodyMuted}>{query ? 'No patients match your search.' : 'No patient accounts yet.'}</Text>
        ) : (
          filteredPatients.map((p) => (
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
        filteredDoctors.length === 0 ? (
          <Text style={typography.bodyMuted}>{query ? 'No doctors match your search.' : 'No doctor accounts yet.'}</Text>
        ) : (
          filteredDoctors.map((d) => (
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
        filteredEntries.length === 0 ? (
          <Text style={typography.bodyMuted}>{query ? 'No reports match your search.' : 'No reports submitted yet.'}</Text>
        ) : (
          filteredEntries.map((e) => (
            <Pressable key={e.id} onPress={() => router.push({ pathname: '/admin/report', params: { entryId: e.id } })}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{e.patientName}</Text>
                  <Text style={typography.bodyMuted}>
                    {e.conditionName} — {new Date(e.createdAt).toLocaleDateString()}
                    {e.doctorName ? ` · ${e.doctorName}` : ''}
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
