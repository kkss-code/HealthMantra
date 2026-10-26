import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { TextField } from './TextField';
import { PillButton } from './PillButton';
import { RepeatableFieldDef } from '../types/questionnaire';
import { colors, spacing } from '../theme/theme';

interface Props {
  fields: RepeatableFieldDef[];
  itemLabel: string;
  value: Record<string, string>[];
  onChange: (value: Record<string, string>[]) => void;
}

export function RepeatableGroup({ fields, itemLabel, value, onChange }: Props) {
  const items = value.length > 0 ? value : [];

  function updateItem(index: number, key: string, text: string) {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: text } : item));
    onChange(next);
  }

  function addItem() {
    onChange([...items, {}]);
  }

  function deleteItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Card key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>
              {itemLabel} {index + 1}
            </Text>
            <PillButton label="Delete" variant="secondary" onPress={() => deleteItem(index)} />
          </View>
          <View style={styles.fieldList}>
            {fields.map((field) => (
              <View key={field.key}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextField
                  placeholder={field.placeholder}
                  value={item[field.key] ?? ''}
                  onChangeText={(text) => updateItem(index, field.key, text)}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                />
              </View>
            ))}
          </View>
        </Card>
      ))}
      <PillButton label={`+ Add ${itemLabel}`} variant="secondary" onPress={addItem} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  itemCard: { gap: spacing.sm },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontWeight: '700', color: colors.text, fontSize: 15 },
  fieldList: { gap: spacing.sm },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
});
