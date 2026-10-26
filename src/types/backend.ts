import { AppUser, Doctor, Role } from './domain';
import { DiaryEntry, DiaryStatus, DoctorNote } from './questionnaire';
import { StoredCondition, StoredQuestionStep } from './content';

export interface Backend {
  readonly mode: 'local' | 'supabase';

  signUp(params: { name: string; email: string; password: string; role: Role }): Promise<AppUser>;
  signIn(params: { email: string; password: string }): Promise<AppUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AppUser | null>;
  updateProfile(userId: string, patch: Partial<AppUser>): Promise<AppUser>;
  listAccountsByRole(role: Role): Promise<AppUser[]>;

  createDiaryEntry(entry: Pick<DiaryEntry, 'patientId' | 'patientName' | 'conditionId' | 'conditionName' | 'answers' | 'findings'>): Promise<DiaryEntry>;
  getDiaryEntry(entryId: string): Promise<DiaryEntry | null>;
  listDiaryEntriesForPatient(patientId: string): Promise<DiaryEntry[]>;
  listAllDiaryEntries(): Promise<DiaryEntry[]>;
  updateDiaryEntryStatus(entryId: string, status: DiaryStatus): Promise<void>;
  addDoctorNote(entryId: string, note: DoctorNote): Promise<void>;

  // Patient-facing content: Patient Admin owns these, patients just read them.
  listConditions(): Promise<StoredCondition[]>;
  upsertCondition(condition: StoredCondition): Promise<StoredCondition>;
  deleteCondition(conditionId: string): Promise<void>;
  listQuestionSteps(conditionId: string): Promise<StoredQuestionStep[]>;
  upsertQuestionStep(step: StoredQuestionStep): Promise<StoredQuestionStep>;
  deleteQuestionStep(stepId: string): Promise<void>;
  reorderQuestionSteps(conditionId: string, orderedStepIds: string[]): Promise<void>;

  // Doctor directory (bookable listing): Doctor Admin owns these.
  listDoctors(): Promise<Doctor[]>;
  upsertDoctor(doctor: Doctor): Promise<Doctor>;
  deleteDoctor(doctorId: string): Promise<void>;

  // Stores a local file (photo or signature) and returns a URI the rest of
  // the app can render/share. Local mode just echoes the device URI back;
  // Supabase mode uploads to Storage and returns a public URL.
  uploadAsset(params: { localUri: string; bucket: 'photos' | 'signatures'; fileName: string }): Promise<string>;
}
