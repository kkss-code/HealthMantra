import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

interface Props {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}

export function RadioList({ options, value, onChange }: Props) {
  return (
    <View style={styles.list}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable key={option} style={styles.row} onPress={() => onChange(option)}>
            <View style={[styles.circle, selected && styles.circleSelected]}>
              {selected ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.label}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function YesNo({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return <RadioList options={['Yes', 'No']} value={value} onChange={onChange} />;
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 6 },
  circle: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: { borderColor: colors.primary },
  dot: { width: 11, height: 11, borderRadius: radius.pill, backgroundColor: colors.primary },
  label: { flex: 1, fontSize: 16, color: colors.text, lineHeight: 22 },
});
