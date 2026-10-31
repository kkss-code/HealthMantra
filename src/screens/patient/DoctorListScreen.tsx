import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { TopBar } from '../../components/TopBar';
import { backend } from '../../services/backend';
import { AppUser } from '../../types/domain';
import { colors, spacing, typography } from '../../theme/theme';

export function DoctorListScreen() {
  const { conditionName } = useLocalSearchParams<{ conditionName?: string }>();
  const [doctors, setDoctors] = useState<AppUser[]>([]);

  useEffect(() => {
    backend.listAccountsByRole('doctor').then(setDoctors);
  }, []);

  const recommended = conditionName ? doctors.filter((d) => d.specialty === conditionName) : doctors.slice(0, 1);
  const others = doctors.filter((d) => !recommended.includes(d));

  return (
    <ScreenContainer scroll={false}>
      <TopBar title="Doctor" showHome />
      <ScreenContainer>
        <Text style={typography.h2}>Our Recommendation</Text>
        {recommended.map((d) => (
          <DoctorCard key={d.id} doctor={d} />
        ))}

        <Text style={[typography.h2, { marginTop: spacing.sm }]}>All Doctors</Text>
        {others.map((d) => (
          <DoctorCard key={d.id} doctor={d} />
        ))}
      </ScreenContainer>
    </ScreenContainer>
  );
}

function DoctorCard({ doctor }: { doctor: AppUser }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.avatar}>{doctor.avatarEmoji ?? '🧑‍⚕️'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={typography.bodyMuted}>{doctor.specialty ?? 'General'}</Text>
      </View>
      {doctor.price != null ? <Text style={styles.price}>₹{doctor.price}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { fontSize: 32 },
  name: { fontWeight: '700', color: colors.text },
  price: { fontWeight: '700', color: colors.primary },
});
