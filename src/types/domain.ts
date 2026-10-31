export type Role = 'patient' | 'doctor' | 'admin';

export const ROLE_LABELS: Record<Role, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
};

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  gender?: string;
  birthdate?: string;
  avatarEmoji?: string;
  specialty?: string; // doctors only
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  price: number;
  avatarEmoji: string;
}
