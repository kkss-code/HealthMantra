import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { Card } from '../../components/Card';
import { PillButton } from '../../components/PillButton';
import { backend } from '../../services/backend';
import { useContentStore } from '../../state/contentStore';
import { StoredQuestionStep } from '../../types/content';
import { colors, spacing, typography } from '../../theme/theme';

const TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  textarea: 'Long text',
  number: 'Number',
  select: 'Choice',
  yesno: 'Yes/No',
  date: 'Date',
  photo: 'Photo',
  repeatable: 'Repeatable list',
};

export function QuestionsListScreen() {
  const { conditionId, conditionName } = useLocalSearchParams<{ conditionId: string; conditionName: string }>();
  const [steps, setSteps] = useState<StoredQuestionStep[]>([]);
  const reloadContent = useContentStore((s) => s.load);

  const load = useCallback(() => {
    backend.listQuestionSteps(conditionId).then(setSteps);
  }, [conditionId]);

  useFocusEffect(load);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSteps(reordered);
    await backend.reorderQuestionSteps(conditionId, reordered.map((s) => s.id));
    await reloadContent();
  }

  async function handleDelete(stepId: string) {
    await backend.deleteQuestionStep(stepId);
    await reloadContent();
    load();
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={conditionName} />
      <ScreenContainer>
        <Text style={typography.bodyMuted}>{steps.length} question{steps.length === 1 ? '' : 's'} in this intake, in order.</Text>
        <PillButton label="+ Add Question" onPress={() => router.push({ pathname: '/admin-patient/question-edit', params: { conditionId } })} fullWidth />

        {steps.map((step, index) => (
          <Card key={step.id} style={styles.row}>
            <View style={styles.reorder}>
              <Pressable onPress={() => move(index, -1)} disabled={index === 0} hitSlop={6}>
                <Text style={[styles.arrow, index === 0 && styles.arrowDisabled]}>▲</Text>
              </Pressable>
              <Pressable onPress={() => move(index, 1)} disabled={index === steps.length - 1} hitSlop={6}>
                <Text style={[styles.arrow, index === steps.length - 1 && styles.arrowDisabled]}>▼</Text>
              </Pressable>
            </View>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: '/admin-patient/question-edit', params: { conditionId, stepId: step.id } })}
            >
              <Text style={styles.question} numberOfLines={2}>{step.question}</Text>
              <Text style={styles.typeBadge}>{TYPE_LABELS[step.type] ?? step.type}</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(step.id)} hitSlop={8}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </Pressable>
          </Card>
        ))}
      </ScreenContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reorder: { alignItems: 'center', gap: 2 },
  arrow: { fontSize: 12, color: colors.primary },
  arrowDisabled: { color: colors.textFaint },
  question: { fontWeight: '600', color: colors.text },
  typeBadge: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
