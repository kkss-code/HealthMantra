// Generic, data-driven questionnaire schema. One question per screen; the
// renderer (screens/intake/QuestionScreen.tsx) switches on `type`. Conditions
// and their steps are admin-editable content stored in the backend (see
// types/content.ts + state/contentStore.ts) and assembled into this shape at
// read time, so adding a condition means an admin authoring it in the app,
// not a new screen.

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'yesno' | 'date' | 'photo';

export interface RepeatableFieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface QuestionStep {
  id: string;
  question: string;
  helperText?: string;
  type: FieldType | 'repeatable';
  options?: string[]; // for 'select'
  maxLength?: number; // for 'text' | 'number', shown as a "x/N" counter
  placeholder?: string;
  // 'repeatable' lets the patient add/delete multiple entries of the same
  // shape (medications, surgeries, allergies, exercise regimens, ...).
  repeatableFields?: RepeatableFieldDef[];
  repeatableItemLabel?: string; // e.g. "Medication"
}

export interface ConditionMeta {
  id: string;
  name: string;
  icon: string; // emoji, used on service tiles until real iconography is supplied
  color: string;
  tagline: string;
  description: string;
}

export interface ConditionSchema extends ConditionMeta {
  steps: QuestionStep[];
}

export interface Finding {
  label: string;
  percent: number;
  flag?: 'red' | 'normal';
}

export type RepeatableValue = Record<string, string>[];
export type AnswerValue = string | RepeatableValue;
export type AnswerMap = Record<string, AnswerValue>;

export interface DoctorNote {
  doctorName: string;
  note: string;
  signatureUri?: string;
  createdAt: string;
}

export type DiaryStatus = 'pending' | 'accepted' | 'declined';

export interface DiaryEntry {
  id: string;
  patientId: string;
  patientName: string;
  conditionId: string;
  conditionName: string;
  createdAt: string;
  answers: AnswerMap;
  findings?: Finding[];
  status: DiaryStatus;
  doctorNote?: DoctorNote;
  doctorId?: string; // set once the patient picks a doctor from "Find a Doctor"
  doctorName?: string;
}

// Follow-up conversation on an entry, after the doctor's first (signed)
// DoctorNote. Either side can keep replying — patient asks a follow-up,
// doctor replies, and so on — without re-running the whole intake.
export interface DiaryMessage {
  id: string;
  entryId: string;
  senderRole: 'patient' | 'doctor';
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}
