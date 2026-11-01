import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { TextField } from '../../components/TextField';
import { useAuthStore } from '../../state/authStore';
import { useContentStore } from '../../state/contentStore';
import { backend } from '../../services/backend';
import { DiaryEntry } from '../../types/questionnaire';
import { colors, radius, spacing, typography } from '../../theme/theme';

export function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [search, setSearch] = useState('');
  const conditions = useContentStore((s) => s.conditions);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      backend.listDiaryEntriesForPatient(user.id).then(setEntries);
    }, [user])
  );

  const latest = entries[0];
  const visibleConditions = conditions.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenContainer>
      <View>
        <Text style={typography.h1}>Hi {user?.name ?? 'there'}!</Text>
        <Text style={typography.bodyMuted}>I am feeling better</Text>
      </View>

      {latest ? (
        <Pressable onPress={() => router.push({ pathname: '/patient/report', params: { entryId: latest.id } })}>
          <Card style={styles.banner}>
            <View style={styles.bannerRow}>
              <Text style={styles.bannerAvatar}>{conditions.find((c) => c.id === latest.conditionId)?.icon ?? '🩺'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Status of your {latest.conditionName} note</Text>
                <Text style={typography.bodyMuted}>{new Date(latest.createdAt).toLocaleDateString()}</Text>
              </View>
              <StatusPill status={latest.status} />
            </View>
          </Card>
        </Pressable>
      ) : (
        <Card style={styles.banner}>
          <Text style={styles.bannerTitle}>Early protection for family health</Text>
          <Text style={typography.bodyMuted}>Log a condition below to get started.</Text>
        </Card>
      )}

      <TextField placeholder="Search" value={search} onChangeText={setSearch} />

      <View style={styles.sectionHeader}>
        <Text style={typography.h2}>Our Services</Text>
        <Pressable onPress={() => router.push('/patient/services')}>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={visibleConditions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.serviceTile}
            onPress={() => router.push({ pathname: '/patient/condition-intro', params: { conditionId: item.id } })}
          >
            <View style={[styles.serviceIcon, { borderColor: item.color }]}>
              <Text style={{ fontSize: 26 }}>{item.icon}</Text>
            </View>
            <Text style={styles.serviceLabel}>{item.name}</Text>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: { gap: spacing.sm },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bannerAvatar: { fontSize: 28 },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: colors.primary, fontWeight: '600' },
  serviceTile: { alignItems: 'center', gap: spacing.xs, width: 76 },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    borderWidth: 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
