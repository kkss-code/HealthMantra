import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { backend } from '../../services/backend';
import { Doctor } from '../../types/domain';
import { typography } from '../../theme/theme';

export function DoctorEditScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId?: string }>();

  const [existing, setExisting] = useState<Doctor | null>(null);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [price, setPrice] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('🧑‍⚕️');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    backend.listDoctors().then((all) => {
      const found = all.find((d) => d.id === doctorId);
      if (!found) return;
      setExisting(found);
      setName(found.name);
      setSpecialty(found.specialty);
      setPrice(String(found.price));
      setAvatarEmoji(found.avatarEmoji);
    });
  }, [doctorId]);

  async function handleSave() {
    setSaving(true);
    try {
      await backend.upsertDoctor({
        id: doctorId ?? '',
        name,
        specialty,
        price: Number(price) || 0,
        avatarEmoji,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!doctorId) return;
    Alert.alert('Remove this doctor from the directory?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await backend.deleteDoctor(doctorId);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={existing ? 'Edit Doctor' : 'New Doctor'} />
      <ScreenContainer>
        <View>
          <Text style={typography.label}>Name</Text>
          <TextField value={name} onChangeText={setName} placeholder="Dr. Jane Doe" />
        </View>
        <View>
          <Text style={typography.label}>Specialty</Text>
          <TextField value={specialty} onChangeText={setSpecialty} placeholder="e.g. Headache" />
        </View>
        <View>
          <Text style={typography.label}>Price</Text>
          <TextField value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 400" />
        </View>
        <View>
          <Text style={typography.label}>Avatar (emoji)</Text>
          <TextField value={avatarEmoji} onChangeText={setAvatarEmoji} maxLength={4} />
        </View>

        <PillButton label="Save" onPress={handleSave} loading={saving} disabled={!name || !specialty} fullWidth />
        {existing ? <PillButton label="Remove Doctor" variant="danger" onPress={handleDelete} fullWidth /> : null}
      </ScreenContainer>
    </ScreenContainer>
  );
}
