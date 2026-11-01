import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TopBar } from '../../components/TopBar';
import { TextField } from '../../components/TextField';
import { PillButton } from '../../components/PillButton';
import { backend } from '../../services/backend';
import { useAuthStore } from '../../state/authStore';
import { ChatMessage } from '../../types/chat';
import { colors, radius, spacing, typography } from '../../theme/theme';

// Standing doctor<->patient chat, separate from the per-report back-and-forth
// on ReportScreen — a normal message thread, not tied to any one entry.
export function ChatThreadScreen() {
  const { doctorId, patientId, counterpartName } = useLocalSearchParams<{
    doctorId: string;
    patientId: string;
    counterpartName?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<any>(null);

  const load = useCallback(() => {
    if (!doctorId || !patientId) return;
    backend.listChatMessages(doctorId, patientId).then((msgs) => {
      setMessages(msgs);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
    });
  }, [doctorId, patientId]);

  useFocusEffect(load);

  async function handleSend() {
    if (!user || !draft.trim() || !doctorId || !patientId) return;
    setSending(true);
    try {
      await backend.sendChatMessage({
        doctorId,
        patientId,
        senderId: user.id,
        senderRole: user.role as 'doctor' | 'patient',
        body: draft.trim(),
      });
      setDraft('');
      const msgs = await backend.listChatMessages(doctorId, patientId);
      setMessages(msgs);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setSending(false);
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <TopBar title={counterpartName ?? 'Chat'} showHome />
      <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.messages}>
        {messages.length === 0 ? (
          <Text style={[typography.bodyMuted, styles.empty]}>No messages yet — say hello 👋</Text>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id;
            return (
              <View key={m.id} style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{m.body}</Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.composer}>
        <TextField value={draft} onChangeText={setDraft} placeholder="Message…" style={styles.input} onSubmitEditing={handleSend} />
        <PillButton label="Send" icon="➤" onPress={handleSend} loading={sending} disabled={!draft.trim()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  messages: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: spacing.lg },
  bubbleRow: { maxWidth: '80%' },
  bubbleRowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 10 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleTextMine: { color: '#fff', fontSize: 15 },
  bubbleTextTheirs: { color: colors.text, fontSize: 15 },
  timestamp: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, paddingVertical: 10 },
});
