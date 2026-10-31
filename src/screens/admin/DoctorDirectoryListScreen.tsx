import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { backend } from '../../services/backend';
import { AppUser } from '../../types/domain';
import { colors, spacing, typography } from '../../theme/theme';

export function DoctorDirectoryListScreen() {
  const [doctors, setDoctors] = useState<AppUser[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    backend.listAccountsByRole('doctor').then(setDoctors);
  }, []);

  useFocusEffect(load);

  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () => (query ? doctors.filter((d) => d.name.toLowerCase().includes(query) || (d.specialty ?? '').toLowerCase().includes(query)) : doctors),
    [doctors, query]
  );

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Doctors</Text>
      <Text style={typography.bodyMuted}>Real doctor login accounts. This is what patients see when they tap &ldquo;Find a Doctor&rdquo; — tap one to set their specialty and consult price.</Text>

      {doctors.length > 0 ? <TextField placeholder="Search by name or specialty" value={search} onChangeText={setSearch} autoCapitalize="none" /> : null}

      {filtered.length === 0 ? (
        <Text style={typography.bodyMuted}>{query ? 'No doctors match your search.' : 'No doctor accounts yet.'}</Text>
      ) : (
        filtered.map((d) => (
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
