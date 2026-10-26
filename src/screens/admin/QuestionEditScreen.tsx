import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { ChipSelect } from '../../components/ChipSelect';
import { Card } from '../../components/Card';
import { backend } from '../../services/backend';
import { useContentStore } from '../../state/contentStore';
import { FieldType, RepeatableFieldDef } from '../../types/questionnaire';
import { spacing, typography } from '../../theme/theme';

const TYPE_OPTIONS: { value: FieldType | 'repeatable'; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Choice' },
  { value: 'yesno', label: 'Yes/No' },
  { value: 'date', label: 'Date' },
  { value: 'photo', label: 'Photo' },
  { value: 'repeatable', label: 'Repeatable list' },
];

const SUB_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

function slugify(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'field';
}

export function QuestionEditScreen() {
  const { conditionId, stepId } = useLocalSearchParams<{ conditionId: string; stepId?: string }>();
  const stepsByCondition = useContentStore((s) => s.stepsByCondition);
  const reloadContent = useContentStore((s) => s.load);
  const existing = stepsByCondition[conditionId]?.find((s) => s.id === stepId);

  const [question, setQuestion] = useState(existing?.question ?? '');
  const [helperText, setHelperText] = useState(existing?.helperText ?? '');
  const [type, setType] = useState<FieldType | 'repeatable'>(existing?.type ?? 'text');
  const [optionsText, setOptionsText] = useState((existing?.options ?? []).join('\n'));
  const [maxLength, setMaxLength] = useState(existing?.maxLength ? String(existing.maxLength) : '');
  const [placeholder, setPlaceholder] = useState(existing?.placeholder ?? '');
  const [repeatableItemLabel, setRepeatableItemLabel] = useState(existing?.repeatableItemLabel ?? 'Item');
  const [repeatableFields, setRepeatableFields] = useState<RepeatableFieldDef[]>(existing?.repeatableFields ?? []);
  const [saving, setSaving] = useState(false);

  function addRepeatableField() {
    setRepeatableFields((fields) => [...fields, { key: `field_${fields.length + 1}`, label: '', type: 'text' }]);
  }

  function updateRepeatableField(index: number, patch: Partial<RepeatableFieldDef>) {
    setRepeatableFields((fields) => fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeRepeatableField(index: number) {
    setRepeatableFields((fields) => fields.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const existingSteps = stepsByCondition[conditionId] ?? [];
      await backend.upsertQuestionStep({
        id: stepId ?? '',
        conditionId,
        order: existing?.order ?? existingSteps.length,
        question,
        helperText: helperText || undefined,
        type,
        options: type === 'select' ? optionsText.split('\n').map((o) => o.trim()).filter(Boolean) : undefined,
        maxLength: maxLength ? Number(maxLength) : undefined,
        placeholder: placeholder || undefined,
        repeatableFields: type === 'repeatable' ? repeatableFields.map((f) => ({ ...f, key: f.key || slugify(f.label) })) : undefined,
        repeatableItemLabel: type === 'repeatable' ? repeatableItemLabel : undefined,
      });
      await reloadContent();
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!stepId) return;
    Alert.alert('Delete this question?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await backend.deleteQuestionStep(stepId);
          await reloadContent();
          router.back();
        },
      },
    ]);
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={existing ? 'Edit Question' : 'New Question'} />
      <ScreenContainer>
        <View>
          <Text style={typography.label}>Question</Text>
          <TextField value={question} onChangeText={setQuestion} placeholder="What do you want to ask the patient?" multiline />
        </View>
        <View>
          <Text style={typography.label}>Helper text (optional)</Text>
          <TextField value={helperText} onChangeText={setHelperText} placeholder="Shown under the question" />
        </View>
        <View>
          <Text style={typography.label}>Answer type</Text>
          <View style={{ marginTop: spacing.xs }}>
            <ChipSelect options={TYPE_OPTIONS} value={type} onChange={(v) => setType(v as FieldType | 'repeatable')} />
          </View>
        </View>

        {type === 'select' ? (
          <View>
            <Text style={typography.label}>Options (one per line)</Text>
            <TextField value={optionsText} onChangeText={setOptionsText} placeholder={'Daily\nWeekly\nMonthly'} multiline />
          </View>
        ) : null}

        {type === 'text' || type === 'number' ? (
          <View>
            <Text style={typography.label}>Max length (optional, shows a counter)</Text>
            <TextField value={maxLength} onChangeText={setMaxLength} keyboardType="numeric" placeholder="e.g. 3" />
          </View>
        ) : null}

        {type !== 'repeatable' && type !== 'select' && type !== 'yesno' ? (
          <View>
            <Text style={typography.label}>Placeholder (optional)</Text>
            <TextField value={placeholder} onChangeText={setPlaceholder} placeholder="e.g. e.g. 72" />
          </View>
        ) : null}

        {type === 'repeatable' ? (
          <View style={{ gap: spacing.md }}>
            <View>
              <Text style={typography.label}>Item name (e.g. &ldquo;Medication&rdquo;)</Text>
              <TextField value={repeatableItemLabel} onChangeText={setRepeatableItemLabel} placeholder="Medication" />
            </View>
            {repeatableFields.map((field, index) => (
              <Card key={index} style={{ gap: spacing.sm }}>
                <View style={styles.subRow}>
                  <Text style={typography.label}>Field {index + 1}</Text>
                  <PillButton label="Remove" variant="secondary" onPress={() => removeRepeatableField(index)} />
                </View>
                <TextField
                  value={field.label}
                  onChangeText={(v) => updateRepeatableField(index, { label: v, key: slugify(v) })}
                  placeholder="Label, e.g. Dose in mg"
                />
                <ChipSelect
                  options={SUB_TYPE_OPTIONS}
                  value={field.type}
                  onChange={(v) => updateRepeatableField(index, { type: v as FieldType })}
                />
              </Card>
            ))}
            <PillButton label="+ Add Field" variant="secondary" onPress={addRepeatableField} fullWidth />
          </View>
        ) : null}

        <PillButton label="Save" onPress={handleSave} loading={saving} disabled={!question} fullWidth />
        {existing ? <PillButton label="Delete Question" variant="danger" onPress={handleDelete} fullWidth /> : null}
      </ScreenContainer>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
