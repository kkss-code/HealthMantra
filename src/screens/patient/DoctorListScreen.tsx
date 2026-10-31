import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { TopBar } from '../../components/TopBar';
import { backend } from '../../services/backend';
import { AppUser } from '../../types/domain';
import { colors, spacing, typography } from '../../theme/theme';

export function DoctorListScreen() {
  const { conditionName, entryId } = useLocalSearchParams<{ conditionName?: string; entryId?: string }>();
  const [doctors, setDoctors] = useState<AppUser[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    backend.listAccountsByRole('doctor').then(setDoctors);
  }, []);

  const recommended = conditionName ? doctors.filter((d) => d.specialty === conditionName) : doctors.slice(0, 1);
  const others = doctors.filter((d) => !recommended.includes(d));

  async function handlePick(doctor: AppUser) {
    if (!entryId || assigning) return;
    setAssigning(doctor.id);
    try {
      await backend.assignDoctor(entryId, doctor.id, doctor.name);
      router.back();
    } finally {
      setAssigning(null);
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title="Doctor" showHome />
      <ScreenContainer>
        <Text style={typography.h2}>Our Recommendation</Text>
        {recommended.map((d) => (
          <DoctorCard key={d.id} doctor={d} onPress={entryId ? () => handlePick(d) : undefined} loading={assigning === d.id} />
        ))}

        <Text style={[typography.h2, { marginTop: spacing.sm }]}>All Doctors</Text>
        {others.map((d) => (
          <DoctorCard key={d.id} doctor={d} onPress={entryId ? () => handlePick(d) : undefined} loading={assigning === d.id} />
        ))}
      </ScreenContainer>
    </ScreenContainer>
  );
}

function DoctorCard({ doctor, onPress, loading }: { doctor: AppUser; onPress?: () => void; loading?: boolean }) {
  const content = (
    <Card style={styles.card}>
      <Text style={styles.avatar}>{doctor.avatarEmoji ?? '🧑‍⚕️'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={typography.bodyMuted}>{doctor.specialty ?? 'General'}</Text>
      </View>
      {doctor.price != null ? <Text style={styles.price}>{loading ? '…' : `₹${doctor.price}`}</Text> : null}
    </Card>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { fontSize: 32 },
  name: { fontWeight: '700', color: colors.text },
  price: { fontWeight: '700', color: colors.primary },
});
