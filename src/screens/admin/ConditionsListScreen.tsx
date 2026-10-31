import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PillButton } from '../../components/PillButton';
import { useContentStore } from '../../state/contentStore';
import { colors, radius, spacing, typography } from '../../theme/theme';

export function ConditionsListScreen() {
  const conditions = useContentStore((s) => s.conditions);
  const load = useContentStore((s) => s.load);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={typography.h1}>Conditions</Text>
          <Text style={typography.bodyMuted}>What patients see on Home and can log a note for.</Text>
        </View>
      </View>

      <PillButton label="+ Add Condition" onPress={() => router.push('/admin/condition-edit')} fullWidth />

      {conditions.map((c) => (
        <Card key={c.id} style={styles.row}>
          <Pressable
            style={styles.rowMain}
            onPress={() => router.push({ pathname: '/admin/questions-list', params: { conditionId: c.id, conditionName: c.name } })}
          >
            <View style={[styles.icon, { borderColor: c.color }]}>
              <Text style={{ fontSize: 22 }}>{c.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={typography.bodyMuted}>{c.tagline}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push({ pathname: '/admin/condition-edit', params: { conditionId: c.id } })} hitSlop={8}>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </Pressable>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  name: { fontWeight: '700', color: colors.text, fontSize: 15 },
});
