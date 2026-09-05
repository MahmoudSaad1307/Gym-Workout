import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { WorkoutLog, ExerciseLog, CardioLog, Split } from '@/store/useGymStore';
import type { Json } from '@/types/database.types';

export const workoutService = {
  async getWorkoutLogs(userId: string): Promise<WorkoutLog[]> {
    if (!isSupabaseConfigured || !userId) return [];

    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to fetch workout logs:', error.message);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      date: row.date,
      split: row.split as Split,
      cardio: {
        time: row.cardio_time,
        distance: Number(row.cardio_distance),
        calories: row.cardio_calories,
      },
      exercises: (row.exercises as unknown as ExerciseLog[]) || [],
    }));
  },

  async createWorkoutLog(userId: string, log: WorkoutLog): Promise<boolean> {
    if (!isSupabaseConfigured || !userId) return false;

    const { error } = await supabase.from('workout_logs').insert({
      id: log.id,
      user_id: userId,
      date: log.date,
      split: log.split,
      cardio_time: log.cardio.time,
      cardio_distance: log.cardio.distance,
      cardio_calories: log.cardio.calories,
      exercises: log.exercises as unknown as Json,
    });

    if (error) {
      console.error('Failed to create workout log:', error.message);
      return false;
    }

    return true;
  },

  async updateWorkoutLog(
    logId: string,
    updatedExercises: ExerciseLog[],
    updatedCardio: CardioLog
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('workout_logs')
      .update({
        exercises: updatedExercises as unknown as Json,
        cardio_time: updatedCardio.time,
        cardio_distance: updatedCardio.distance,
        cardio_calories: updatedCardio.calories,
      })
      .eq('id', logId);

    if (error) {
      console.error('Failed to update workout log:', error.message);
      return false;
    }

    return true;
  },

  async deleteWorkoutLog(logId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const { error } = await supabase
      .from('workout_logs')
      .delete()
      .eq('id', logId);

    if (error) {
      console.error('Failed to delete workout log:', error.message);
      return false;
    }

    return true;
  },

  async bulkInsertWorkouts(userId: string, logs: WorkoutLog[]): Promise<boolean> {
    if (!isSupabaseConfigured || !userId || logs.length === 0) return false;

    const rows = logs.map((log) => ({
      id: log.id,
      user_id: userId,
      date: log.date,
      split: log.split,
      cardio_time: log.cardio.time,
      cardio_distance: log.cardio.distance,
      cardio_calories: log.cardio.calories,
      exercises: log.exercises as unknown as Json,
    }));

    const { error } = await supabase
      .from('workout_logs')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Failed to bulk insert workout logs:', error.message);
      return false;
    }

    return true;
  },
};
