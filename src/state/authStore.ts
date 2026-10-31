import { create } from 'zustand';
import { AppUser, ROLE_LABELS, Role } from '../types/domain';
import { backend } from '../services/backend';
import { isAdminRole, isWebPlatform } from '../utils/access';

interface AuthState {
  user: AppUser | null;
  initializing: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string, expectedRole?: Role) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<AppUser>) => Promise<void>;
}

function assertAdminAllowedHere(role: Role) {
  if (isAdminRole(role) && !isWebPlatform) {
    throw new Error('Admin accounts can only sign in from the website.');
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initializing: true,

  initialize: async () => {
    const user = await backend.getCurrentUser();
    // A cached admin session from a previous web login should not silently
    // carry over if this same account data is ever opened in the native app.
    if (user && isAdminRole(user.role) && !isWebPlatform) {
      await backend.signOut();
      set({ user: null, initializing: false });
      return;
    }
    set({ user, initializing: false });
  },

  signIn: async (email, password, expectedRole) => {
    const user = await backend.signIn({ email, password });
    if (expectedRole && user.role !== expectedRole) {
      await backend.signOut();
      throw new Error(`This account is registered as ${ROLE_LABELS[user.role]}, not ${ROLE_LABELS[expectedRole]}.`);
    }
    try {
      assertAdminAllowedHere(user.role);
    } catch (e) {
      await backend.signOut();
      throw e;
    }
    set({ user });
  },

  signUp: async (name, email, password, role) => {
    assertAdminAllowedHere(role);
    const user = await backend.signUp({ name, email, password, role });
    set({ user });
  },

  signOut: async () => {
    await backend.signOut();
    set({ user: null });
  },

  updateProfile: async (patch) => {
    const current = get().user;
    if (!current) return;
    const updated = await backend.updateProfile(current.id, patch);
    set({ user: updated });
  },
}));
