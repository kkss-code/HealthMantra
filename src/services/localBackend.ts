import { AppUser, Role } from '../types/domain';
import { DiaryEntry, DiaryStatus, DoctorNote } from '../types/questionnaire';
import { StoredCondition, StoredQuestionStep } from '../types/content';
import { Backend } from '../types/backend';
import { getItem, makeId, setItem } from './storage';
import { conditionSchemas } from '../data/questionnaires';

interface StoredAccount extends AppUser {
  password: string;
}

const KEYS = {
  accounts: 'accounts',
  session: 'session',
  diary: 'diary',
  conditions: 'conditions',
  questionSteps: 'questionSteps',
  seeded: 'seeded',
};

const SEED_DOCTOR_ACCOUNTS: Omit<StoredAccount, 'id'>[] = [
  { name: 'Dr. Ayushi Rao', email: 'dr.ayushi@healthmantra.test', password: 'DoctorTest123', role: 'doctor', specialty: 'Headache', price: 500, avatarEmoji: '👩‍⚕️' },
  { name: 'Dr. Ram Singh', email: 'dr.ram@healthmantra.test', password: 'DoctorTest123', role: 'doctor', specialty: 'Blood Pressure', price: 400, avatarEmoji: '🧑‍⚕️' },
  { name: 'Dr. Leo D’Souza', email: 'dr.leo@healthmantra.test', password: 'DoctorTest123', role: 'doctor', specialty: 'Diabetes', price: 450, avatarEmoji: '👨‍⚕️' },
  { name: 'Dr. Emma Watson', email: 'dr.emma@healthmantra.test', password: 'DoctorTest123', role: 'doctor', specialty: 'Dermatology', price: 350, avatarEmoji: '👩‍⚕️' },
];

const SEED_ADMINS: Omit<StoredAccount, 'id'>[] = [
  { name: 'HealthMantra Admin', email: 'admin@healthmantra.test', password: 'admin123', role: 'admin', avatarEmoji: '🗂️' },
];

async function getAccounts(): Promise<StoredAccount[]> {
  return getItem<StoredAccount[]>(KEYS.accounts, []);
}

async function ensureSeeded(): Promise<void> {
  const seeded = await getItem<boolean>(KEYS.seeded, false);
  if (seeded) return;

  const conditions: StoredCondition[] = conditionSchemas.map((schema, index) => ({
    id: schema.id,
    name: schema.name,
    icon: schema.icon,
    color: schema.color,
    tagline: schema.tagline,
    description: schema.description,
    order: index,
  }));
  await setItem(KEYS.conditions, conditions);

  const steps: StoredQuestionStep[] = conditionSchemas.flatMap((schema) =>
    schema.steps.map((step, index) => ({ ...step, conditionId: schema.id, order: index }))
  );
  await setItem(KEYS.questionSteps, steps);

  const accounts = await getAccounts();
  for (const seed of [...SEED_ADMINS, ...SEED_DOCTOR_ACCOUNTS]) {
    if (!accounts.some((a) => a.email === seed.email)) {
      accounts.push({ ...seed, id: makeId('user') });
    }
  }
  await setItem(KEYS.accounts, accounts);

  await setItem(KEYS.seeded, true);
}

export class LocalBackend implements Backend {
  readonly mode = 'local' as const;
  private readonly ready: Promise<void>;

  constructor() {
    this.ready = ensureSeeded();
  }

  async signUp({ name, email, password, role }: { name: string; email: string; password: string; role: Role }): Promise<AppUser> {
    await this.ready;
    const accounts = await getAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const avatarEmoji = role === 'doctor' ? '🧑‍⚕️' : role === 'patient' ? '🙂' : '🗂️';
    const account: StoredAccount = { id: makeId('user'), name, email, password, role, avatarEmoji };
    accounts.push(account);
    await setItem(KEYS.accounts, accounts);
    await setItem(KEYS.session, account.id);
    return stripPassword(account);
  }

  async signIn({ email, password }: { email: string; password: string }): Promise<AppUser> {
    await this.ready;
    const accounts = await getAccounts();
    const found = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      throw new Error('Invalid email or password.');
    }
    await setItem(KEYS.session, found.id);
    return stripPassword(found);
  }

  async signOut(): Promise<void> {
    await setItem(KEYS.session, null);
  }

  async getCurrentUser(): Promise<AppUser | null> {
    await this.ready;
    const sessionId = await getItem<string | null>(KEYS.session, null);
    if (!sessionId) return null;
    const accounts = await getAccounts();
    const found = accounts.find((a) => a.id === sessionId);
    return found ? stripPassword(found) : null;
  }

  async updateProfile(userId: string, patch: Partial<AppUser>): Promise<AppUser> {
    const accounts = await getAccounts();
    const idx = accounts.findIndex((a) => a.id === userId);
    if (idx === -1) throw new Error('User not found.');
    accounts[idx] = { ...accounts[idx], ...patch };
    await setItem(KEYS.accounts, accounts);
    return stripPassword(accounts[idx]);
  }

  async listAccountsByRole(role: Role): Promise<AppUser[]> {
    await this.ready;
    const accounts = await getAccounts();
    return accounts.filter((a) => a.role === role).map(stripPassword);
  }

  async createDiaryEntry(entry: Pick<DiaryEntry, 'patientId' | 'patientName' | 'conditionId' | 'conditionName' | 'answers' | 'findings'>): Promise<DiaryEntry> {
    const all = await getItem<DiaryEntry[]>(KEYS.diary, []);
    const newEntry: DiaryEntry = {
      ...entry,
      id: makeId('diary'),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    all.unshift(newEntry);
    await setItem(KEYS.diary, all);
    return newEntry;
  }

  async getDiaryEntry(entryId: string): Promise<DiaryEntry | null> {
    const all = await getItem<DiaryEntry[]>(KEYS.diary, []);
    return all.find((e) => e.id === entryId) ?? null;
  }

  async listDiaryEntriesForPatient(patientId: string): Promise<DiaryEntry[]> {
    const all = await getItem<DiaryEntry[]>(KEYS.diary, []);
    return all.filter((e) => e.patientId === patientId);
  }

  async listAllDiaryEntries(): Promise<DiaryEntry[]> {
    return getItem<DiaryEntry[]>(KEYS.diary, []);
  }

  async updateDiaryEntryStatus(entryId: string, status: DiaryStatus): Promise<void> {
    const all = await getItem<DiaryEntry[]>(KEYS.diary, []);
    const idx = all.findIndex((e) => e.id === entryId);
    if (idx === -1) return;
    all[idx] = { ...all[idx], status };
    await setItem(KEYS.diary, all);
  }

  async addDoctorNote(entryId: string, note: DoctorNote): Promise<void> {
    const all = await getItem<DiaryEntry[]>(KEYS.diary, []);
    const idx = all.findIndex((e) => e.id === entryId);
    if (idx === -1) return;
    all[idx] = { ...all[idx], doctorNote: note, status: 'accepted' };
    await setItem(KEYS.diary, all);
  }

  async listConditions(): Promise<StoredCondition[]> {
    await this.ready;
    const all = await getItem<StoredCondition[]>(KEYS.conditions, []);
    return [...all].sort((a, b) => a.order - b.order);
  }

  async upsertCondition(condition: StoredCondition): Promise<StoredCondition> {
    const all = await getItem<StoredCondition[]>(KEYS.conditions, []);
    const idx = all.findIndex((c) => c.id === condition.id);
    const record = condition.id ? condition : { ...condition, id: makeId('cond') };
    if (idx === -1) all.push(record);
    else all[idx] = record;
    await setItem(KEYS.conditions, all);
    return record;
  }

  async deleteCondition(conditionId: string): Promise<void> {
    const all = await getItem<StoredCondition[]>(KEYS.conditions, []);
    await setItem(KEYS.conditions, all.filter((c) => c.id !== conditionId));
    const steps = await getItem<StoredQuestionStep[]>(KEYS.questionSteps, []);
    await setItem(KEYS.questionSteps, steps.filter((s) => s.conditionId !== conditionId));
  }

  async listQuestionSteps(conditionId: string): Promise<StoredQuestionStep[]> {
    await this.ready;
    const all = await getItem<StoredQuestionStep[]>(KEYS.questionSteps, []);
    return all.filter((s) => s.conditionId === conditionId).sort((a, b) => a.order - b.order);
  }

  async upsertQuestionStep(step: StoredQuestionStep): Promise<StoredQuestionStep> {
    const all = await getItem<StoredQuestionStep[]>(KEYS.questionSteps, []);
    const idx = all.findIndex((s) => s.id === step.id);
    const record = step.id ? step : { ...step, id: makeId('step') };
    if (idx === -1) all.push(record);
    else all[idx] = record;
    await setItem(KEYS.questionSteps, all);
    return record;
  }

  async deleteQuestionStep(stepId: string): Promise<void> {
    const all = await getItem<StoredQuestionStep[]>(KEYS.questionSteps, []);
    await setItem(KEYS.questionSteps, all.filter((s) => s.id !== stepId));
  }

  async reorderQuestionSteps(conditionId: string, orderedStepIds: string[]): Promise<void> {
    const all = await getItem<StoredQuestionStep[]>(KEYS.questionSteps, []);
    const orderIndex = new Map(orderedStepIds.map((id, index) => [id, index]));
    const updated = all.map((s) => (s.conditionId === conditionId && orderIndex.has(s.id) ? { ...s, order: orderIndex.get(s.id)! } : s));
    await setItem(KEYS.questionSteps, updated);
  }

  async uploadAsset({ localUri }: { localUri: string; bucket: 'photos' | 'signatures'; fileName: string }): Promise<string> {
    // Local mode keeps the device-local URI as-is; it's readable within the
    // app for the lifetime of the session, which is enough for the demo.
    return localUri;
  }
}

function stripPassword(account: StoredAccount): AppUser {
  const { password, ...rest } = account;
  return rest;
}
