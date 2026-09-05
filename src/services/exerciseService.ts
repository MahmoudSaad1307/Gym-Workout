import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Exercise, Split } from '@/store/useGymStore';

export const exerciseService = {
  async getExercises(): Promise<Exercise[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) {
      console.error('Failed to fetch exercises:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      split: row.split as Split,
      imageUrl: row.image_url || '',
      allSplits: row.all_splits,
    }));
  },

  async addCustomExercise(
    userId: string,
    exercise: { id: string; name: string; split: Split; imageUrl?: string }
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    const { error } = await supabase.from('exercises').insert({
      id: exercise.id,
      user_id: userId,
      name: exercise.name,
      split: exercise.split,
      image_url: exercise.imageUrl || '',
      is_custom: true,
      all_splits: false,
    });

    if (error) {
      console.error('Failed to add custom exercise:', error.message);
      return false;
    }

    return true;
  },

  async editExercise(id: string, name: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('exercises')
      .update({ name })
      .eq('id', id);

    if (error) {
      console.error('Failed to edit exercise:', error.message);
      return false;
    }

    return true;
  },

  async deleteExercise(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase.from('exercises').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete exercise:', error.message);
      return false;
    }

    return true;
  },
};
