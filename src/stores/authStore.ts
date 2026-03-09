/**
 * ORI APP — Auth Store (Zustand)
 * Manages authentication state globally.
 * Session is persisted via Supabase's built-in SecureStore adapter.
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { trackSignUp, trackLogin } from '@/lib/analytics';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, SignUpFormData } from '@/types';

// On web, redirect back to this origin so detectSessionInUrl can exchange the
// PKCE code automatically. On native, use the custom deep link scheme.
const EMAIL_REDIRECT_URL =
  Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081')
    : 'oriapp://verify-email';

interface AuthStore {
  // State
  user:           User | null;
  session:        Session | null;
  profile:        Profile | null;
  isLoading:      boolean;
  isInitialized:  boolean;

  // Actions
  initialize:         () => Promise<void>;
  signUp:             (data: SignUpFormData) => Promise<void>;
  signIn:             (email: string, password: string) => Promise<void>;
  signOut:            () => Promise<void>;
  sendPasswordReset:  (email: string) => Promise<void>;
  updatePassword:     (newPassword: string) => Promise<void>;
  refreshProfile:     () => Promise<void>;
  setSession:         (session: Session | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user:          null,
  session:       null,
  profile:       null,
  isLoading:     false,
  isInitialized: false,

  // ── Initialize: called once on app start ───────────────────────────────────
  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // The SupabaseClient only calls functions.setAuth() on SIGNED_IN /
        // TOKEN_REFRESHED events — NOT when the session is restored from
        // storage (INITIAL_SESSION). Without this, functions.invoke() sends
        // the anon key instead of the user JWT, causing "Invalid JWT" errors.
        supabase.functions.setAuth(session.access_token);
        const profile = await fetchProfile(session.user.id);
        set({ session, user: session.user, profile });
      }

      // Listen for auth state changes (token refresh, sign-out, etc.)
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          supabase.functions.setAuth(session.access_token);
          const profile = await fetchProfile(session.user.id);
          set({ session, user: session.user, profile });
        } else {
          supabase.functions.setAuth('');
          set({ session: null, user: null, profile: null });
        }
      });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  // ── Sign Up ────────────────────────────────────────────────────────────────
  signUp: async (data) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email:    data.email,
        password: data.password,
        options: {
          emailRedirectTo: EMAIL_REDIRECT_URL,
          data: {
            full_name:  data.fullName,
            phone:      data.phone,
            patient_id: data.patientId ?? null,
            patient_state: data.patientState ?? null,
            is_21_plus: data.is21Plus,
          },
        },
      });
      if (error) throw error;
      trackSignUp();
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Sign In ────────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const profile = await fetchProfile(data.user.id);
      set({ session: data.session, user: data.user, profile });
      trackLogin();
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Sign Out ───────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null, user: null, profile: null });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Password Reset ─────────────────────────────────────────────────────────
  sendPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'oriapp://reset-password',
    });
    if (error) throw error;
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  // ── Refresh Profile ────────────────────────────────────────────────────────
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await fetchProfile(user.id);
    set({ profile });
  },

  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },
}));

// ─── Helper: Fetch Profile ────────────────────────────────────────────────────
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[AuthStore] Failed to fetch profile:', error.message);
    return null;
  }
  return data as Profile;
}

// ─── Convenience Selectors ────────────────────────────────────────────────────
export const selectUser        = (s: AuthStore) => s.user;
export const selectProfile     = (s: AuthStore) => s.profile;
export const selectIsAuth      = (s: AuthStore) => !!s.session;
export const selectIsLoading   = (s: AuthStore) => s.isLoading;
export const selectIsInit      = (s: AuthStore) => s.isInitialized;
