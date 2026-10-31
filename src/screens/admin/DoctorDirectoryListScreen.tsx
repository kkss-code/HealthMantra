import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { PillButton } from '../../components/PillButton';
import { backend } from '../../services/backend';
import { Doctor } from '../../types/domain';
import { colors, spacing, typography } from '../../theme/theme';

export function DoctorDirectoryListScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const load = useCallback(() => {
    backend.listDoctors().then(setDoctors);
  }, []);

  useFocusEffect(load);

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Doctor Directory</Text>
      <Text style={typography.bodyMuted}>The bookable doctor list patients see from a report.</Text>

      <PillButton label="+ Add Doctor" onPress={() => router.push('/admin/doctor-edit')} fullWidth />

      {doctors.map((d) => (
        <Pressable key={d.id} onPress={() => router.push({ pathname: '/admin/doctor-edit', params: { doctorId: d.id } })}>
          <Card style={styles.row}>
            <Text style={styles.avatar}>{d.avatarEmoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{d.name}</Text>
              <Text style={typography.bodyMuted}>{d.specialty}</Text>
            </View>
            <Text style={styles.price}>₹{d.price}</Text>
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { fontSize: 28 },
  name: { fontWeight: '700', color: colors.text },
  price: { fontWeight: '700', color: colors.primary },
});
