import { AppUser, Role } from '../types/domain';
import { DiaryEntry, DiaryMessage, DiaryStatus, DoctorNote } from '../types/questionnaire';
import { ChatMessage, ChatThreadSummary } from '../types/chat';
import { StoredCondition, StoredQuestionStep } from '../types/content';
import { Backend } from '../types/backend';
import { supabase } from './supabaseClient';

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

function mapProfile(row: any): AppUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    gender: row.gender ?? undefined,
    birthdate: row.birthdate ?? undefined,
    avatarEmoji: row.avatar_emoji ?? undefined,
    specialty: row.specialty ?? undefined,
    price: row.price ?? undefined,
  };
}

function mapDiaryRow(row: any): DiaryEntry {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    conditionId: row.condition_id,
    conditionName: row.condition_name,
    createdAt: row.created_at,
    answers: row.answers ?? {},
    findings: row.findings ?? undefined,
    status: row.status,
    doctorNote: row.doctor_note ?? undefined,
    doctorId: row.doctor_id ?? undefined,
    doctorName: row.doctor_name ?? undefined,
  };
}

function mapMessageRow(row: any): DiaryMessage {
  return {
    id: row.id,
    entryId: row.entry_id,
    senderRole: row.sender_role,
    senderId: row.sender_id,
    senderName: row.sender_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapChatRow(row: any): ChatMessage {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapConditionRow(row: any): StoredCondition {
  return { id: row.id, name: row.name, icon: row.icon, color: row.color, tagline: row.tagline, description: row.description, order: row.sort_order };
}

function mapQuestionStepRow(row: any): StoredQuestionStep {
  return {
    id: row.id,
    conditionId: row.condition_id,
    order: row.sort_order,
    question: row.question,
    helperText: row.helper_text ?? undefined,
    type: row.type,
    options: row.options ?? undefined,
    maxLength: row.max_length ?? undefined,
    placeholder: row.placeholder ?? undefined,
    repeatableFields: row.repeatable_fields ?? undefined,
    repeatableItemLabel: row.repeatable_item_label ?? undefined,
  };
}

export class SupabaseBackend implements Backend {
  readonly mode = 'supabase' as const;

  async signUp({ name, email, password, role }: { name: string; email: string; password: string; role: Role }): Promise<AppUser> {
    const client = requireClient();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    const userId = data.user?.id;
    if (!userId) throw new Error('Sign up did not return a user. Check your Supabase email-confirmation settings.');

    const avatarEmoji = role === 'doctor' ? '🧑‍⚕️' : role === 'patient' ? '🙂' : '🗂️';
    const { error: profileError } = await client.from('profiles').insert({ id: userId, name, email, role, avatar_emoji: avatarEmoji });
    if (profileError) throw profileError;

    return { id: userId, name, email, role, avatarEmoji };
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<AppUser> {
    const client = requireClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const userId = data.user.id;
    const { data: profile, error: profileError } = await client.from('profiles').select('*').eq('id', userId).single();
    if (profileError) throw profileError;
    return mapProfile(profile);
  }

  async signOut(): Promise<void> {
    const client = requireClient();
    await client.auth.signOut();
  }

  async getCurrentUser(): Promise<AppUser | null> {
    const client = requireClient();
    const { data } = await client.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return null;
    const { data: profile, error } = await client.from('profiles').select('*').eq('id', userId).single();
    if (error || !profile) return null;
    return mapProfile(profile);
  }

  async updateProfile(userId: string, patch: Partial<AppUser>): Promise<AppUser> {
    const client = requireClient();
    // The profile-edit form starts optional text fields as '' until typed.
    // Postgres' `date` column rejects '' outright (only a real date or null
    // is valid), and storing '' for text columns would defeat `?? 'Not set'`
    // fallbacks elsewhere, so normalize blank-but-provided fields to null.
    const birthdate = patch.birthdate === '' ? null : patch.birthdate;
    const gender = patch.gender === '' ? null : patch.gender;
    const specialty = patch.specialty === '' ? null : patch.specialty;
    const { data, error } = await client
      .from('profiles')
      .update({ name: patch.name, gender, birthdate, avatar_emoji: patch.avatarEmoji, specialty, price: patch.price })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return mapProfile(data);
  }

  async listAccountsByRole(role: Role): Promise<AppUser[]> {
    const client = requireClient();
    const { data, error } = await client.from('profiles').select('*').eq('role', role);
    if (error) throw error;
    return (data ?? []).map(mapProfile);
  }

  async createDiaryEntry(entry: Pick<DiaryEntry, 'patientId' | 'patientName' | 'conditionId' | 'conditionName' | 'answers' | 'findings'>): Promise<DiaryEntry> {
    const client = requireClient();
    const { data, error } = await client
      .from('diary_entries')
      .insert({
        patient_id: entry.patientId,
        patient_name: entry.patientName,
        condition_id: entry.conditionId,
        condition_name: entry.conditionName,
        answers: entry.answers,
        findings: entry.findings ?? null,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return mapDiaryRow(data);
  }

  async getDiaryEntry(entryId: string): Promise<DiaryEntry | null> {
    const client = requireClient();
    const { data, error } = await client.from('diary_entries').select('*').eq('id', entryId).single();
    if (error) return null;
    return mapDiaryRow(data);
  }

  async listDiaryEntriesForPatient(patientId: string): Promise<DiaryEntry[]> {
    const client = requireClient();
    const { data, error } = await client.from('diary_entries').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDiaryRow);
  }

  async listDiaryEntriesForDoctor(doctorId: string): Promise<DiaryEntry[]> {
    const client = requireClient();
    const { data, error } = await client.from('diary_entries').select('*').eq('doctor_id', doctorId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDiaryRow);
  }

  async listAllDiaryEntries(): Promise<DiaryEntry[]> {
    const client = requireClient();
    const { data, error } = await client.from('diary_entries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapDiaryRow);
  }

  async updateDiaryEntryStatus(entryId: string, status: DiaryStatus): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('diary_entries').update({ status }).eq('id', entryId);
    if (error) throw error;
  }

  async assignDoctor(entryId: string, doctorId: string, doctorName: string): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('diary_entries').update({ doctor_id: doctorId, doctor_name: doctorName }).eq('id', entryId);
    if (error) throw error;
  }

  async addDoctorNote(entryId: string, note: DoctorNote): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('diary_entries').update({ doctor_note: note, status: 'accepted' }).eq('id', entryId);
    if (error) throw error;
  }

  async listMessages(entryId: string): Promise<DiaryMessage[]> {
    const client = requireClient();
    const { data, error } = await client.from('diary_messages').select('*').eq('entry_id', entryId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapMessageRow);
  }

  async addMessage(entryId: string, message: Pick<DiaryMessage, 'senderRole' | 'senderId' | 'senderName' | 'body'>): Promise<DiaryMessage> {
    const client = requireClient();
    const { data, error } = await client
      .from('diary_messages')
      .insert({
        entry_id: entryId,
        sender_role: message.senderRole,
        sender_id: message.senderId,
        sender_name: message.senderName,
        body: message.body,
      })
      .select()
      .single();
    if (error) throw error;
    return mapMessageRow(data);
  }

  async listChatThreadsForDoctor(doctorId: string): Promise<ChatThreadSummary[]> {
    const client = requireClient();
    const { data: entries, error } = await client.from('diary_entries').select('patient_id, patient_name').eq('doctor_id', doctorId);
    if (error) throw error;
    const patients = new Map<string, string>();
    (entries ?? []).forEach((e: any) => patients.set(e.patient_id, e.patient_name));

    const { data: messages, error: msgError } = await client
      .from('chat_messages')
      .select('patient_id, body, created_at')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });
    if (msgError) throw msgError;

    const latest = new Map<string, { body: string; createdAt: string }>();
    (messages ?? []).forEach((m: any) => {
      if (!latest.has(m.patient_id)) latest.set(m.patient_id, { body: m.body, createdAt: m.created_at });
    });

    return Array.from(patients.entries())
      .map(([patientId, patientName]) => ({
        doctorId,
        doctorName: '',
        patientId,
        patientName,
        lastMessage: latest.get(patientId)?.body,
        lastMessageAt: latest.get(patientId)?.createdAt,
      }))
      .sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));
  }

  async listChatThreadsForPatient(patientId: string): Promise<ChatThreadSummary[]> {
    const client = requireClient();
    const { data: entries, error } = await client.from('diary_entries').select('doctor_id, doctor_name').eq('patient_id', patientId).not('doctor_id', 'is', null);
    if (error) throw error;
    const doctors = new Map<string, string>();
    (entries ?? []).forEach((e: any) => doctors.set(e.doctor_id, e.doctor_name));

    const { data: messages, error: msgError } = await client
      .from('chat_messages')
      .select('doctor_id, body, created_at')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (msgError) throw msgError;

    const latest = new Map<string, { body: string; createdAt: string }>();
    (messages ?? []).forEach((m: any) => {
      if (!latest.has(m.doctor_id)) latest.set(m.doctor_id, { body: m.body, createdAt: m.created_at });
    });

    return Array.from(doctors.entries())
      .map(([doctorId, doctorName]) => ({
        doctorId,
        doctorName,
        patientId,
        patientName: '',
        lastMessage: latest.get(doctorId)?.body,
        lastMessageAt: latest.get(doctorId)?.createdAt,
      }))
      .sort((a, b) => (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? ''));
  }

  async listChatMessages(doctorId: string, patientId: string): Promise<ChatMessage[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('chat_messages')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapChatRow);
  }

  async sendChatMessage(message: Pick<ChatMessage, 'doctorId' | 'patientId' | 'senderId' | 'senderRole' | 'body'>): Promise<ChatMessage> {
    const client = requireClient();
    const { data, error } = await client
      .from('chat_messages')
      .insert({
        doctor_id: message.doctorId,
        patient_id: message.patientId,
        sender_id: message.senderId,
        sender_role: message.senderRole,
        body: message.body,
      })
      .select()
      .single();
    if (error) throw error;
    return mapChatRow(data);
  }

  async listConditions(): Promise<StoredCondition[]> {
    const client = requireClient();
    const { data, error } = await client.from('conditions').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapConditionRow);
  }

  async upsertCondition(condition: StoredCondition): Promise<StoredCondition> {
    const client = requireClient();
    const row = {
      id: condition.id || undefined,
      name: condition.name,
      icon: condition.icon,
      color: condition.color,
      tagline: condition.tagline,
      description: condition.description,
      sort_order: condition.order,
    };
    const { data, error } = await client.from('conditions').upsert(row).select().single();
    if (error) throw error;
    return mapConditionRow(data);
  }

  async deleteCondition(conditionId: string): Promise<void> {
    const client = requireClient();
    await client.from('question_steps').delete().eq('condition_id', conditionId);
    const { error } = await client.from('conditions').delete().eq('id', conditionId);
    if (error) throw error;
  }

  async listQuestionSteps(conditionId: string): Promise<StoredQuestionStep[]> {
    const client = requireClient();
    const { data, error } = await client.from('question_steps').select('*').eq('condition_id', conditionId).order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapQuestionStepRow);
  }

  async upsertQuestionStep(step: StoredQuestionStep): Promise<StoredQuestionStep> {
    const client = requireClient();
    const row = {
      id: step.id || undefined,
      condition_id: step.conditionId,
      sort_order: step.order,
      question: step.question,
      helper_text: step.helperText ?? null,
      type: step.type,
      options: step.options ?? null,
      max_length: step.maxLength ?? null,
      placeholder: step.placeholder ?? null,
      repeatable_fields: step.repeatableFields ?? null,
      repeatable_item_label: step.repeatableItemLabel ?? null,
    };
    const { data, error } = await client.from('question_steps').upsert(row).select().single();
    if (error) throw error;
    return mapQuestionStepRow(data);
  }

  async deleteQuestionStep(stepId: string): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('question_steps').delete().eq('id', stepId);
    if (error) throw error;
  }

  async reorderQuestionSteps(conditionId: string, orderedStepIds: string[]): Promise<void> {
    const client = requireClient();
    await Promise.all(orderedStepIds.map((id, index) => client.from('question_steps').update({ sort_order: index }).eq('id', id).eq('condition_id', conditionId)));
  }

  async uploadAsset({ localUri, bucket, fileName }: { localUri: string; bucket: 'photos' | 'signatures'; fileName: string }): Promise<string> {
    const client = requireClient();
    const response = await fetch(localUri);
    const blob = await response.blob();
    const { error } = await client.storage.from(bucket).upload(fileName, blob, {
      contentType: blob.type || (bucket === 'photos' ? 'image/jpeg' : 'image/png'),
      upsert: true,
    });
    if (error) throw error;
    const { data } = client.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }
}
