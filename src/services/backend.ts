import { Backend } from '../types/backend';
import { supabaseConfigured } from './supabaseClient';
import { LocalBackend } from './localBackend';
import { SupabaseBackend } from './supabaseBackend';

// Swapping backends is just this one line: once EXPO_PUBLIC_SUPABASE_URL and
// EXPO_PUBLIC_SUPABASE_ANON_KEY are set (see .env.example), the app
// transparently starts talking to Supabase instead of on-device storage.
// No screen or store needed to change.
export const backend: Backend = supabaseConfigured ? new SupabaseBackend() : new LocalBackend();
