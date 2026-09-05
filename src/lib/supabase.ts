import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.startsWith('=') ? rawUrl.replace(/^=+/, '').trim() : rawUrl;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    !supabaseUrl.includes('your-project-ref')
);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud sync.'
  );
}

// Fallback empty strings prevent createClient from throwing at module evaluation if env is not yet populated
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
