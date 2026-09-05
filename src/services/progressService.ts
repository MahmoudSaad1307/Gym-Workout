import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ProgressEntry, WeightUnit } from '@/store/useGymStore';

export const progressService = {
  async getProgressEntries(userId: string): Promise<ProgressEntry[]> {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch progress entries:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      date: row.date,
      weight: Number(row.weight),
      unit: row.unit as WeightUnit,
      photoUrl: row.photo_url || '',
      notes: row.notes || '',
    }));
  },

  async createProgressEntry(userId: string, entry: ProgressEntry): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    const { error } = await supabase.from('progress_entries').insert({
      id: entry.id,
      user_id: userId,
      date: entry.date,
      weight: entry.weight,
      unit: entry.unit,
      photo_url: entry.photoUrl,
      notes: entry.notes,
    });

    if (error) {
      console.error('Failed to create progress entry:', error.message);
      return false;
    }

    return true;
  },

  async updateProgressEntry(
    id: string,
    data: Partial<Omit<ProgressEntry, 'id'>>
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const updatePayload: Record<string, unknown> = {};
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.weight !== undefined) updatePayload.weight = data.weight;
    if (data.unit !== undefined) updatePayload.unit = data.unit;
    if (data.photoUrl !== undefined) updatePayload.photo_url = data.photoUrl;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    const { error } = await supabase
      .from('progress_entries')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Failed to update progress entry:', error.message);
      return false;
    }

    return true;
  },

  async deleteProgressEntry(id: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('progress_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete progress entry:', error.message);
      return false;
    }

    return true;
  },

  async bulkInsertProgressEntries(
    userId: string,
    entries: ProgressEntry[]
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !userId || entries.length === 0) return false;

    const rows = entries.map((e) => ({
      id: e.id,
      user_id: userId,
      date: e.date,
      weight: e.weight,
      unit: e.unit,
      photo_url: e.photoUrl,
      notes: e.notes,
    }));

    const { error } = await supabase
      .from('progress_entries')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Failed to bulk insert progress entries:', error.message);
      return false;
    }

    return true;
  },
};
