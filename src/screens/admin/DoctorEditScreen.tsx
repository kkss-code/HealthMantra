import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { backend } from '../../services/backend';
import { AppUser } from '../../types/domain';
import { typography } from '../../theme/theme';

export function DoctorEditScreen() {
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();

  const [existing, setExisting] = useState<AppUser | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    backend.listAccountsByRole('doctor').then((all) => {
      const found = all.find((d) => d.id === doctorId);
      if (!found) return;
      setExisting(found);
      setSpecialty(found.specialty ?? '');
      setPrice(found.price != null ? String(found.price) : '');
    });
  }, [doctorId]);

  async function handleSave() {
    if (!doctorId) return;
    setSaving(true);
    try {
      await backend.updateProfile(doctorId, { specialty, price: price ? Number(price) : undefined });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={existing?.name ?? 'Doctor'} />
      <ScreenContainer>
        <Text style={typography.bodyMuted}>{existing?.email}</Text>
        <View>
          <Text style={typography.label}>Specialty</Text>
          <TextField value={specialty} onChangeText={setSpecialty} placeholder="e.g. Headache" />
        </View>
        <View>
          <Text style={typography.label}>Consult price</Text>
          <TextField value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 400" />
        </View>

        <PillButton label="Save" onPress={handleSave} loading={saving} disabled={!specialty} fullWidth />
      </ScreenContainer>
    </ScreenContainer>
  );
}
