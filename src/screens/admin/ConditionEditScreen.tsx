import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { ChipSelect } from '../../components/ChipSelect';
import { useContentStore } from '../../state/contentStore';
import { backend } from '../../services/backend';
import { spacing, typography } from '../../theme/theme';

const COLOR_PRESETS = [
  { value: '#1AA6A6', label: 'Teal' },
  { value: '#E0A82E', label: 'Amber' },
  { value: '#C96BA0', label: 'Pink' },
  { value: '#5B8DEF', label: 'Blue' },
  { value: '#D64545', label: 'Red' },
  { value: '#2FA66A', label: 'Green' },
];

export function ConditionEditScreen() {
  const { conditionId } = useLocalSearchParams<{ conditionId?: string }>();
  const conditions = useContentStore((s) => s.conditions);
  const reloadContent = useContentStore((s) => s.load);
  const existing = conditions.find((c) => c.id === conditionId);

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? '🩺');
  const [color, setColor] = useState(existing?.color ?? COLOR_PRESETS[0].value);
  const [tagline, setTagline] = useState(existing?.tagline ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await backend.upsertCondition({
        id: conditionId ?? '',
        name,
        icon,
        color,
        tagline,
        description,
        order: existing?.order ?? conditions.length,
      });
      await reloadContent();
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!conditionId) return;
    Alert.alert('Delete this condition?', 'Its questions and this listing will be removed. Existing patient reports are kept.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await backend.deleteCondition(conditionId);
          await reloadContent();
          router.back();
        },
      },
    ]);
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={existing ? 'Edit Condition' : 'New Condition'} />
      <ScreenContainer>
        <View>
          <Text style={typography.label}>Name</Text>
          <TextField value={name} onChangeText={setName} placeholder="e.g. Asthma" />
        </View>
        <View>
          <Text style={typography.label}>Icon (emoji)</Text>
          <TextField value={icon} onChangeText={setIcon} placeholder="🫁" maxLength={4} />
        </View>
        <View>
          <Text style={typography.label}>Color</Text>
          <View style={{ marginTop: spacing.xs }}>
            <ChipSelect options={COLOR_PRESETS} value={color} onChange={setColor} />
          </View>
        </View>
        <View>
          <Text style={typography.label}>Tagline</Text>
          <TextField value={tagline} onChangeText={setTagline} placeholder="Shown on the condition intro screen" />
        </View>
        <View>
          <Text style={typography.label}>Description</Text>
          <TextField value={description} onChangeText={setDescription} placeholder="A sentence or two about this condition" multiline />
        </View>

        <PillButton label="Save" onPress={handleSave} loading={saving} disabled={!name} fullWidth />
        {existing ? <PillButton label="Delete Condition" variant="danger" onPress={handleDelete} fullWidth /> : null}
      </ScreenContainer>
    </ScreenContainer>
  );
}
