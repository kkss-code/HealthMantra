import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { SignaturePadModal } from '../../components/SignaturePadModal';
import { backend } from '../../services/backend';
import { useAuthStore } from '../../state/authStore';
import { makeId } from '../../services/storage';
import { colors, typography } from '../../theme/theme';

export function AddNoteScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const user = useAuthStore((s) => s.user);
  const [note, setNote] = useState('');
  const [signatureUri, setSignatureUri] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      let signature: string | undefined;
      if (signatureUri) {
        signature = await backend.uploadAsset({ localUri: signatureUri, bucket: 'signatures', fileName: `${makeId('sig')}.png` });
      }
      await backend.addDoctorNote(entryId, {
        doctorName: user.name,
        note,
        signatureUri: signature,
        createdAt: new Date().toISOString(),
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit this note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title="Add Note" />
      <ScreenContainer>
        <Text style={typography.label}>Write Note</Text>
        <TextField value={note} onChangeText={setNote} multiline placeholder="Enter your note for the patient" />

        <View>
          <Text style={typography.label}>Signature</Text>
          <PillButton
            label={signatureUri ? 'Signed ✓ — tap to redo' : 'Sign here'}
            variant="secondary"
            onPress={() => setShowSignaturePad(true)}
            fullWidth
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PillButton label="Submit" onPress={handleSubmit} loading={submitting} fullWidth disabled={!note} />
      </ScreenContainer>

      <SignaturePadModal visible={showSignaturePad} onClose={() => setShowSignaturePad(false)} onSave={setSignatureUri} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger },
});
