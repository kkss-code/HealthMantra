import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { backend } from '../../services/backend';
import { AppUser } from '../../types/domain';
import { colors, spacing, typography } from '../../theme/theme';

export function DoctorDirectoryListScreen() {
  const [doctors, setDoctors] = useState<AppUser[]>([]);

  const load = useCallback(() => {
    backend.listAccountsByRole('doctor').then(setDoctors);
  }, []);

  useFocusEffect(load);

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Doctors</Text>
      <Text style={typography.bodyMuted}>Real doctor login accounts. This is what patients see when they tap &ldquo;Find a Doctor&rdquo; — tap one to set their specialty and consult price.</Text>

      {doctors.length === 0 ? (
        <Text style={typography.bodyMuted}>No doctor accounts yet.</Text>
      ) : (
        doctors.map((d) => (
          <Pressable key={d.id} onPress={() => router.push({ pathname: '/admin/doctor-edit', params: { doctorId: d.id } })}>
            <Card style={styles.row}>
              <Text style={styles.avatar}>{d.avatarEmoji ?? '🧑‍⚕️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{d.name}</Text>
                <Text style={typography.bodyMuted}>{d.specialty ?? 'No specialty set'}</Text>
              </View>
              {d.price != null ? <Text style={styles.price}>₹{d.price}</Text> : null}
            </Card>
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { fontSize: 28 },
  name: { fontWeight: '700', color: colors.text },
  price: { fontWeight: '700', color: colors.primary },
});
