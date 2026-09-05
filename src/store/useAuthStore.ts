import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({ loading: false, initialized: true });
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      set({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
        initialized: true,
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          loading: false,
        });
      });
    } catch (err) {
      console.error('Failed to initialize auth state:', err);
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured yet. Please check your .env settings.' };
    }

    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({
      loading: false,
      user: data.user,
      session: data.session,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  },

  signUp: async (email, password) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured yet. Please check your .env settings.' };
    }

    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    set({ loading: false });

    if (error) {
      return { error: error.message };
    }

    const needsEmailConfirmation = !data.session && Boolean(data.user);
    if (data.session) {
      set({ user: data.user, session: data.session });
    }

    return { error: null, needsEmailConfirmation };
  },

  signOut: async () => {
    if (!isSupabaseConfigured) return;
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },
}));
