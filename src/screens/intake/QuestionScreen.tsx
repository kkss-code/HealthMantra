import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { ProgressBar } from '../../components/ProgressBar';
import { PillButton } from '../../components/PillButton';
import { TextField } from '../../components/TextField';
import { RadioList, YesNo } from '../../components/RadioList';
import { RepeatableGroup } from '../../components/RepeatableGroup';
import { ActionSheetModal } from '../../components/ActionSheetModal';
import { useIntakeStore } from '../../state/intakeStore';
import { useAuthStore } from '../../state/authStore';
import { backend } from '../../services/backend';
import { computeFindings } from '../../data/findings';
import { colors, radius, spacing, typography } from '../../theme/theme';

export function QuestionScreen() {
  const user = useAuthStore((s) => s.user);
  const schema = useIntakeStore((s) => s.schema);
  const stepIndex = useIntakeStore((s) => s.stepIndex);
  const answers = useIntakeStore((s) => s.answers);
  const setAnswer = useIntakeStore((s) => s.setAnswer);
  const next = useIntakeStore((s) => s.next);
  const back = useIntakeStore((s) => s.back);
  const progress = useIntakeStore((s) => s.progress);
  const reset = useIntakeStore((s) => s.reset);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);

  if (!schema) return null;
  const step = schema.steps[stepIndex];
  const value = answers[step.id];

  async function fromCamera() {
    setShowPhotoSheet(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) setAnswer(step.id, result.assets[0].uri);
  }

  async function fromLibrary() {
    setShowPhotoSheet(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled) setAnswer(step.id, result.assets[0].uri);
  }

  async function handleNext() {
    const isLast = next();
    if (!isLast) return;

    if (!user || !schema) return;
    setSubmitting(true);
    try {
      const latestAnswers = useIntakeStore.getState().answers;
      const findings = computeFindings(schema.id, latestAnswers);
      const entry = await backend.createDiaryEntry({
        patientId: user.id,
        patientName: user.name,
        conditionId: schema.id,
        conditionName: schema.name,
        answers: latestAnswers,
        findings,
      });
      reset();
      router.replace({ pathname: '/patient/report', params: { entryId: entry.id } });
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    const moved = back();
    if (!moved) router.back();
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar onBack={handleBack} showHome />
      <View style={{ paddingHorizontal: spacing.md }}>
        <ProgressBar progress={progress()} />
      </View>

      <ScreenContainer>
        <Text style={typography.question}>{step.question}</Text>
        {step.helperText ? <Text style={typography.bodyMuted}>{step.helperText}</Text> : null}

        {step.type === 'text' || step.type === 'number' ? (
          <TextField
            value={(value as string) ?? ''}
            onChangeText={(t) => setAnswer(step.id, t)}
            placeholder={step.placeholder}
            keyboardType={step.type === 'number' ? 'numeric' : 'default'}
            maxLength={step.maxLength}
            showCounter={!!step.maxLength}
          />
        ) : null}

        {step.type === 'textarea' ? (
          <TextField
            value={(value as string) ?? ''}
            onChangeText={(t) => setAnswer(step.id, t)}
            placeholder={step.placeholder}
            multiline
          />
        ) : null}

        {step.type === 'select' && step.options ? (
          <RadioList options={step.options} value={value as string} onChange={(v) => setAnswer(step.id, v)} />
        ) : null}

        {step.type === 'yesno' ? <YesNo value={value as string} onChange={(v) => setAnswer(step.id, v)} /> : null}

        {step.type === 'date' ? (
          <View>
            <Pressable style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: value ? colors.text : colors.textFaint }}>{(value as string) || 'Select a date'}</Text>
            </Pressable>
            {showDatePicker ? (
              <DateTimePicker
                value={value ? new Date(value as string) : new Date()}
                mode="date"
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) setAnswer(step.id, date.toISOString().slice(0, 10));
                }}
              />
            ) : null}
          </View>
        ) : null}

        {step.type === 'photo' ? (
          <View style={{ gap: spacing.sm }}>
            <Pressable onPress={() => setShowPhotoSheet(true)}>
              <Text style={styles.uploadLink}>Upload your document</Text>
            </Pressable>
            <Pressable style={styles.photoBox} onPress={() => setShowPhotoSheet(true)}>
              {value ? (
                <Image source={{ uri: value as string }} style={styles.photoPreview} />
              ) : (
                <Text style={{ fontSize: 28, color: colors.textFaint }}>+</Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {step.type === 'repeatable' && step.repeatableFields ? (
          <RepeatableGroup
            fields={step.repeatableFields}
            itemLabel={step.repeatableItemLabel ?? 'Item'}
            value={(value as Record<string, string>[]) ?? []}
            onChange={(v) => setAnswer(step.id, v)}
          />
        ) : null}
      </ScreenContainer>

      <View style={styles.footer}>
        {submitting ? <ActivityIndicator color={colors.primary} /> : <PillButton label="Next" icon="→" onPress={handleNext} />}
      </View>

      <ActionSheetModal
        visible={showPhotoSheet}
        title="Attach photograph"
        actions={[
          { label: 'Camera', onPress: fromCamera },
          { label: 'Photos', onPress: fromLibrary },
        ]}
        onCancel={() => setShowPhotoSheet(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  uploadLink: { color: colors.primary, fontWeight: '600' },
  photoBox: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  photoPreview: { width: '100%', height: '100%' },
  footer: { padding: spacing.md, alignItems: 'flex-end' },
});
