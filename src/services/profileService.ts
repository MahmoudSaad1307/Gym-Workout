import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { WeightUnit } from '@/store/useGymStore';

export const profileService = {
  async getProfile(userId: string): Promise<{ unitPreference: WeightUnit } | null> {
    if (!isSupabaseConfigured || !userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('unit_preference')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch profile:', error.message);
      return null;
    }

    if (!data) return null;
    return { unitPreference: data.unit_preference as WeightUnit };
  },

  async updateUnitPreference(userId: string, unitPreference: WeightUnit): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        unit_preference: unitPreference,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to update unit preference:', error.message);
      return false;
    }

    return true;
  },
};
