import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { backend } from '../../services/backend';
import { useAuthStore } from '../../state/authStore';
import { ChatThreadSummary } from '../../types/chat';
import { colors, spacing, typography } from '../../theme/theme';

export function ChatListScreen() {
  const user = useAuthStore((s) => s.user);
  const [threads, setThreads] = useState<ChatThreadSummary[]>([]);
  const [search, setSearch] = useState('');
  const isDoctor = user?.role === 'doctor';

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const fetch = user.role === 'doctor' ? backend.listChatThreadsForDoctor(user.id) : backend.listChatThreadsForPatient(user.id);
      fetch.then(setThreads);
    }, [user])
  );

  const visible = threads.filter((t) => (isDoctor ? t.patientName : t.doctorName).toLowerCase().includes(search.toLowerCase()));

  return (
    <ScreenContainer>
      <Text style={typography.h1}>Chat</Text>
      <Text style={typography.bodyMuted}>Message your {isDoctor ? 'patients' : 'doctors'} directly.</Text>

      <TextField placeholder="Search" value={search} onChangeText={setSearch} />

      {threads.length === 0 ? (
        <Text style={typography.bodyMuted}>
          {isDoctor ? 'No patients assigned to you yet.' : 'Pick a doctor from a report to start chatting.'}
        </Text>
      ) : visible.length === 0 ? (
        <Text style={typography.bodyMuted}>No conversations match your search.</Text>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {visible.map((t) => {
            const name = isDoctor ? t.patientName : t.doctorName;
            return (
              <Pressable
                key={isDoctor ? t.patientId : t.doctorId}
                onPress={() =>
                  router.push({
                    pathname: isDoctor ? '/doctor/chat-thread' : '/patient/chat-thread',
                    params: { doctorId: t.doctorId, patientId: t.patientId, counterpartName: name },
                  })
                }
              >
                <Card style={styles.row}>
                  <Text style={styles.avatar}>{isDoctor ? '🙂' : '🧑‍⚕️'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={typography.bodyMuted} numberOfLines={1}>
                      {t.lastMessage ?? 'Say hello 👋'}
                    </Text>
                  </View>
                  {t.lastMessageAt ? (
                    <Text style={typography.bodyMuted}>
                      {new Date(t.lastMessageAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </Text>
                  ) : null}
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { fontSize: 24 },
  name: { fontWeight: '700', color: colors.text },
});
