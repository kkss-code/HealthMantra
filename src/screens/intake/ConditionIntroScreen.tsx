import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { PillButton } from '../../components/PillButton';
import { useContentStore } from '../../state/contentStore';
import { useIntakeStore } from '../../state/intakeStore';
import { colors, radius, spacing, typography } from '../../theme/theme';

export function ConditionIntroScreen() {
  const { conditionId } = useLocalSearchParams<{ conditionId: string }>();
  const conditions = useContentStore((s) => s.conditions);
  const schema = conditions.find((c) => c.id === conditionId);
  const start = useIntakeStore((s) => s.start);

  if (!schema) return null;

  return (
    <ScreenContainer scroll={false}>
      <TopBar />
      <ScreenContainer>
        <View style={styles.iconWrap}>
          <View style={[styles.icon, { borderColor: schema.color }]}>
            <Text style={{ fontSize: 40 }}>{schema.icon}</Text>
          </View>
        </View>
        <Text style={styles.title}>{schema.name}</Text>
        <Text style={styles.tagline}>{schema.tagline}</Text>
        <Text style={typography.body}>{schema.description}</Text>
      </ScreenContainer>
      <View style={styles.footer}>
        <PillButton
          label="Next"
          icon="→"
          onPress={() => {
            start(conditionId);
            router.push('/patient/question');
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', marginBottom: spacing.sm },
  icon: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    borderWidth: 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
  tagline: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm },
  footer: { padding: spacing.md, alignItems: 'flex-end' },
});
