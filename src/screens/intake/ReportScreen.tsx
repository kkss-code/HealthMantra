import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { Card } from '../../components/Card';
import { PillButton } from '../../components/PillButton';
import { StatusPill } from '../../components/StatusPill';
import { backend } from '../../services/backend';
import { useContentStore } from '../../state/contentStore';
import { useAuthStore } from '../../state/authStore';
import { assembleSchema } from '../../types/content';
import { DiaryEntry, RepeatableValue } from '../../types/questionnaire';
import { buildReportHtml } from '../../utils/reportHtml';
import { colors, spacing, typography } from '../../theme/theme';

export function ReportScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const user = useAuthStore((s) => s.user);
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const load = useCallback(() => {
    backend.getDiaryEntry(entryId).then((e) => {
      setEntry(e);
      setLoading(false);
    });
  }, [entryId]);

  useFocusEffect(load);
  const conditions = useContentStore((s) => s.conditions);
  const stepsByCondition = useContentStore((s) => s.stepsByCondition);
  const schema = useMemo(() => {
    const condition = conditions.find((c) => c.id === entry?.conditionId);
    if (!condition) return null;
    return assembleSchema(condition, stepsByCondition[condition.id] ?? []);
  }, [conditions, stepsByCondition, entry?.conditionId]);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!entry) {
    return (
      <ScreenContainer>
        <Text>Report not found.</Text>
      </ScreenContainer>
    );
  }

  async function handleShare() {
    if (!schema) return;
    setSharing(true);
    try {
      const html = buildReportHtml(entry!, schema, { id: entry!.patientId, name: entry!.patientName, email: '', role: 'patient' });
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } finally {
      setSharing(false);
    }
  }

  const simpleSteps = schema?.steps.filter((s) => s.type !== 'repeatable' && s.type !== 'photo' && entry.answers[s.id]) ?? [];
  const repeatableSteps = schema?.steps.filter((s) => s.type === 'repeatable' && (entry.answers[s.id] as RepeatableValue)?.length) ?? [];
  const photoStep = schema?.steps.find((s) => s.type === 'photo' && entry.answers[s.id]);

  return (
    <ScreenContainer scroll={false}>
      <TopBar title="Report" showHome />
      <ScreenContainer>
        <Card style={styles.headerCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.patientName}>{entry.patientName}</Text>
              <Text style={typography.bodyMuted}>{entry.conditionName} — Unique ID {entry.patientId.slice(0, 8)}</Text>
            </View>
            <StatusPill status={entry.status} />
          </View>
        </Card>

        {simpleSteps.length > 0 ? (
          <Card>
            {simpleSteps.map((s) => (
              <View key={s.id} style={styles.row}>
                <Text style={styles.rowLabel}>{s.question}</Text>
                <Text style={typography.body}>{entry.answers[s.id] as string}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {repeatableSteps.map((s) => (
          <Card key={s.id}>
            <Text style={styles.sectionLabel}>{s.question}</Text>
            {(entry.answers[s.id] as RepeatableValue).map((item, idx) => (
              <View key={idx} style={styles.repeatRow}>
                {s.repeatableFields!.map((f) => (item[f.key] ? <Text key={f.key} style={typography.bodyMuted}>{f.label}: {item[f.key]}</Text> : null))}
              </View>
            ))}
          </Card>
        ))}

        {photoStep ? (
          <Card>
            <Text style={styles.sectionLabel}>Additional documents</Text>
            <Image source={{ uri: entry.answers[photoStep.id] as string }} style={styles.photo} />
          </Card>
        ) : null}

        {entry.findings ? (
          <Card>
            <Text style={styles.sectionLabel}>Positive findings on social history</Text>
            {entry.findings.map((f) => (
              <View key={f.label} style={styles.row}>
                <Text style={[typography.body, f.flag === 'red' && { color: colors.danger, fontWeight: '700' }]}>{f.label}</Text>
                <Text style={[typography.body, f.flag === 'red' && { color: colors.danger, fontWeight: '700' }]}>{f.percent}%</Text>
              </View>
            ))}
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionLabel}>Current management plan</Text>
          {entry.doctorNote ? (
            <View style={{ gap: 4 }}>
              <Text style={typography.bodyMuted}>{new Date(entry.doctorNote.createdAt).toLocaleDateString()}</Text>
              <Text style={typography.body}>Doctor&apos;s note: {entry.doctorNote.doctorName}</Text>
              <Text style={typography.body}>{entry.doctorNote.note}</Text>
              {entry.doctorNote.signatureUri ? <Image source={{ uri: entry.doctorNote.signatureUri }} style={styles.signature} /> : null}
            </View>
          ) : entry.doctorName ? (
            <Text style={typography.bodyMuted}>Sent to {entry.doctorName} — awaiting review.</Text>
          ) : (
            <Text style={typography.bodyMuted}>Awaiting doctor review.</Text>
          )}
        </Card>
      </ScreenContainer>

      <View style={styles.footer}>
        <PillButton label="Share" variant="secondary" icon="📤" onPress={handleShare} loading={sharing} />
        {user?.role === 'patient' && !entry.doctorNote ? (
          <PillButton
            label={entry.doctorId ? 'Change Doctor' : 'Find a Doctor'}
            icon="→"
            onPress={() => router.push({ pathname: '/patient/doctor-list', params: { conditionName: entry.conditionName, entryId: entry.id } })}
          />
        ) : null}
        {user?.role === 'doctor' && !entry.doctorNote ? (
          <PillButton
            label="Add Note"
            icon="→"
            onPress={() => router.push({ pathname: '/doctor/add-note', params: { entryId: entry.id } })}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: { backgroundColor: colors.primary, borderColor: colors.primary },
  patientName: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: 6 },
  rowLabel: { flex: 1, color: colors.textMuted, fontSize: 13 },
  sectionLabel: { color: colors.danger, fontWeight: '700', marginBottom: spacing.sm },
  repeatRow: { paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border },
  photo: { width: 160, height: 160, borderRadius: 12, marginTop: spacing.sm },
  signature: { width: 160, height: 80, marginTop: spacing.sm, resizeMode: 'contain' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, padding: spacing.md },
});
