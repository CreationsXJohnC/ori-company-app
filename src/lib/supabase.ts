/**
 * ORI APP — Supabase Client
 * Handles session persistence with SecureStore (native) or localStorage (web).
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/constants';

// ─── Secure Storage Adapter ───────────────────────────────────────────────────
// Native: expo-secure-store (encrypted on device)
// Web: localStorage (tokens are short-lived; upgrade to secure cookies for production)
const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      const value = localStorage.getItem(key);
      return Promise.resolve(value);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// ─── Supabase Client ──────────────────────────────────────────────────────────
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:           ExpoSecureStoreAdapter,
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType:          'pkce',
  },
  global: {
    headers: {
      'x-app-name': 'ori-app',
    },
  },
});

// ─── Helper: Invoke Edge Function ─────────────────────────────────────────────
export async function invokeFunction<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<{ data: T | null; error: Error | null }> {
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
  });
  return {
    data: data ?? null,
    error: error ? new Error(error.message) : null,
  };
}

// ─── Helper: Get Current Session ──────────────────────────────────────────────
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// ─── Helper: Get Current User ─────────────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// ─── Helper: Upload to Storage ────────────────────────────────────────────────
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert:      options?.upsert ?? false,
    });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  return publicUrl;
}

export default supabase;
