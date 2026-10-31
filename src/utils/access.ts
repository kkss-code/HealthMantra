import { Platform } from 'react-native';
import { Role } from '../types/domain';

// The admin role (content management, doctor directory management, data
// browsing) is only reachable from the web build of this app — the native
// app (iOS/Android, including Expo Go) only ever shows Patient and Doctor.
// This is enforced both in the role-selection UI and, defensively, in
// authStore so a direct login attempt with admin credentials on native is
// also rejected.
export const isWebPlatform = Platform.OS === 'web';

export function isAdminRole(role: Role): boolean {
  return role === 'admin';
}
