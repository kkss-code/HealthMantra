// A standing chat between a doctor and a patient they're assigned to (via
// at least one diary entry) — separate from the per-report back-and-forth
// in DiaryMessage, and not tied to any single condition or entry.

export interface ChatMessage {
  id: string;
  doctorId: string;
  patientId: string;
  senderId: string;
  senderRole: 'doctor' | 'patient';
  body: string;
  createdAt: string;
}

export interface ChatThreadSummary {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  lastMessage?: string;
  lastMessageAt?: string;
}
