import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

interface Props extends TextInputProps {
  maxLength?: number;
  showCounter?: boolean;
}

export function TextField({ style, maxLength, showCounter, value, ...rest }: Props) {
  return (
    <View>
      <TextInput
        style={[styles.input, rest.multiline && styles.multiline, style]}
        placeholderTextColor={colors.textFaint}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      {showCounter && maxLength ? (
        <Text style={styles.counter}>
          {(value?.length ?? 0)}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  counter: { textAlign: 'right', fontSize: 12, color: colors.textFaint, marginTop: 4 },
});
