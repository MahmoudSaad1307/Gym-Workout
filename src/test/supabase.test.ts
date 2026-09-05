import { describe, it, expect, beforeEach } from 'vitest';
import { useGymStore } from '@/store/useGymStore';
import { migrationService } from '@/services/migrationService';

describe('GymStore and Migration tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useGymStore.getState().resetToDefaults();
  });

  it('initializes with default exercises and initial state', () => {
    const state = useGymStore.getState();
    expect(state.exercises.length).toBeGreaterThan(0);
    expect(state.workoutLogs).toEqual([]);
    expect(state.progressEntries).toEqual([]);
    expect(state.unitPreference).toBe('lbs');
  });

  it('adds, updates, and deletes an exercise locally', () => {
    const store = useGymStore.getState();
    store.addExercise('Custom Squat', 'Workout A');

    const added = useGymStore.getState().exercises.find((e) => e.name === 'Custom Squat');
    expect(added).toBeDefined();
    expect(added?.split).toBe('Workout A');

    if (added) {
      useGymStore.getState().editExercise(added.id, 'Updated Squat');
      const edited = useGymStore.getState().exercises.find((e) => e.id === added.id);
      expect(edited?.name).toBe('Updated Squat');

      useGymStore.getState().deleteExercise(added.id);
      const deleted = useGymStore.getState().exercises.find((e) => e.id === added.id);
      expect(deleted).toBeUndefined();
    }
  });

  it('adds and manages progress entries', () => {
    useGymStore.getState().addProgressEntry({
      date: new Date().toISOString(),
      weight: 180,
      unit: 'lbs',
      photoUrl: 'https://example.com/photo.jpg',
      notes: 'Feeling strong',
    });

    const entries = useGymStore.getState().progressEntries;
    expect(entries.length).toBe(1);
    expect(entries[0].weight).toBe(180);
    expect(entries[0].notes).toBe('Feeling strong');

    useGymStore.getState().editProgressEntry(entries[0].id, { weight: 182 });
    expect(useGymStore.getState().progressEntries[0].weight).toBe(182);

    useGymStore.getState().deleteProgressEntry(entries[0].id);
    expect(useGymStore.getState().progressEntries.length).toBe(0);
  });

  it('migrationService correctly identifies when there is no local data', () => {
    const data = migrationService.getLocalData();
    expect(data).toBeNull();
  });

  it('migrationService correctly extracts local storage data', () => {
    const fakeStorage = {
      state: {
        workoutLogs: [
          {
            id: 'local-1',
            date: new Date().toISOString(),
            split: 'Workout A',
            cardio: { time: 10, distance: 1.5, calories: 100 },
            exercises: [],
          },
        ],
        progressEntries: [
          {
            id: 'p-1',
            date: new Date().toISOString(),
            weight: 175,
            unit: 'lbs',
            photoUrl: '',
            notes: '',
          },
        ],
        exercises: [
          {
            id: 'custom-123',
            name: 'Local Exercise',
            split: 'Workout B',
            imageUrl: '',
          },
        ],
        unitPreference: 'kgs',
      },
    };

    localStorage.setItem('gym-tracker-storage', JSON.stringify(fakeStorage));
    const extracted = migrationService.getLocalData();

    expect(extracted).not.toBeNull();
    expect(extracted?.workoutLogs.length).toBe(1);
    expect(extracted?.progressEntries.length).toBe(1);
    expect(extracted?.customExercises.length).toBe(1);
    expect(extracted?.unitPreference).toBe('kgs');
  });
});
