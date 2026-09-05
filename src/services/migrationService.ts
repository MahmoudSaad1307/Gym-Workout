import { workoutService } from './workoutService';
import { progressService } from './progressService';
import { exerciseService } from './exerciseService';
import { profileService } from './profileService';
import type { Exercise, ProgressEntry, WeightUnit, WorkoutLog } from '@/store/useGymStore';

interface LocalStorageData {
  state?: {
    workoutLogs?: WorkoutLog[];
    progressEntries?: ProgressEntry[];
    exercises?: Exercise[];
    unitPreference?: WeightUnit;
  };
}

export const migrationService = {
  getLocalData(): {
    workoutLogs: WorkoutLog[];
    progressEntries: ProgressEntry[];
    customExercises: Exercise[];
    unitPreference: WeightUnit;
  } | null {
    try {
      const raw = localStorage.getItem('gym-tracker-storage');
      if (!raw) return null;

      const parsed: LocalStorageData = JSON.parse(raw);
      const state = parsed.state;
      if (!state) return null;

      const workoutLogs = Array.isArray(state.workoutLogs) ? state.workoutLogs : [];
      const progressEntries = Array.isArray(state.progressEntries) ? state.progressEntries : [];
      const exercises = Array.isArray(state.exercises) ? state.exercises : [];
      const customExercises = exercises.filter(
        (e) => typeof e.id === 'string' && e.id.startsWith('custom-')
      );
      const unitPreference = state.unitPreference || 'lbs';

      const hasData =
        workoutLogs.length > 0 ||
        progressEntries.length > 0 ||
        customExercises.length > 0;

      if (!hasData) return null;

      return {
        workoutLogs,
        progressEntries,
        customExercises,
        unitPreference,
      };
    } catch (e) {
      console.error('Failed to read local storage data for migration:', e);
      return null;
    }
  },

  hasMigrated(userId: string): boolean {
    return localStorage.getItem(`gym-sync-migrated-${userId}`) === 'true';
  },

  setMigrated(userId: string): void {
    localStorage.setItem(`gym-sync-migrated-${userId}`, 'true');
  },

  async migrateLocalData(userId: string): Promise<{
    workoutsCount: number;
    progressCount: number;
    customExercisesCount: number;
  }> {
    const data = this.getLocalData();
    if (!data) {
      return { workoutsCount: 0, progressCount: 0, customExercisesCount: 0 };
    }

    // 1. Sync Unit Preference
    if (data.unitPreference) {
      await profileService.updateUnitPreference(userId, data.unitPreference);
    }

    // 2. Sync Custom Exercises
    let customExercisesCount = 0;
    for (const ex of data.customExercises) {
      const ok = await exerciseService.addCustomExercise(userId, {
        id: ex.id,
        name: ex.name,
        split: ex.split,
        imageUrl: ex.imageUrl,
      });
      if (ok) customExercisesCount += 1;
    }

    // 3. Sync Workout Logs
    let workoutsCount = 0;
    if (data.workoutLogs.length > 0) {
      const ok = await workoutService.bulkInsertWorkouts(userId, data.workoutLogs);
      if (ok) workoutsCount = data.workoutLogs.length;
    }

    // 4. Sync Progress Entries
    let progressCount = 0;
    if (data.progressEntries.length > 0) {
      const ok = await progressService.bulkInsertProgressEntries(userId, data.progressEntries);
      if (ok) progressCount = data.progressEntries.length;
    }

    this.setMigrated(userId);

    return {
      workoutsCount,
      progressCount,
      customExercisesCount,
    };
  },
};
