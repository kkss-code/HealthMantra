import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { useContentStore } from '../../state/contentStore';
import { colors, radius, spacing, typography } from '../../theme/theme';

export function ServicesScreen() {
  const conditions = useContentStore((s) => s.conditions);

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Our Services</Text>
      <Text style={typography.bodyMuted}>Pick a condition to start a new intake note.</Text>

      <View style={styles.grid}>
        {conditions.map((c) => (
          <Pressable
            key={c.id}
            style={styles.tileWrap}
            onPress={() => router.push({ pathname: '/patient/condition-intro', params: { conditionId: c.id } })}
          >
            <Card style={styles.tile}>
              <View style={[styles.icon, { borderColor: c.color }]}>
                <Text style={{ fontSize: 28 }}>{c.icon}</Text>
              </View>
              <Text style={styles.label}>{c.name}</Text>
            </Card>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  tileWrap: { width: '47%' },
  tile: { alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  label: { fontWeight: '700', color: colors.text },
});
