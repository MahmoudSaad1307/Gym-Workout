import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Split = 'Push' | 'Pull' | 'Arms & Core';

export interface Exercise {
  id: string;
  name: string;
  split: Split;
  imageUrl: string;
}

export interface SetEntry {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetEntry[];
}

export interface CardioLog {
  time: number;
  distance: number;
  calories: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  split: Split;
  cardio: CardioLog;
  exercises: ExerciseLog[];
}

interface CurrentWorkout {
  date: Date;
  split: Split;
  cardio: CardioLog;
  exercises: Record<string, SetEntry[]>;
}

interface GymState {
  exercises: Exercise[];
  workoutLogs: WorkoutLog[];
  unitPreference: 'lbs' | 'kgs';
  currentWorkout: CurrentWorkout;

  setUnitPreference: (unit: 'lbs' | 'kgs') => void;
  setSplit: (split: Split) => void;
  setDate: (date: Date) => void;
  updateCardio: (cardio: Partial<CardioLog>) => void;
  updateSet: (exerciseId: string, setIndex: number, data: Partial<SetEntry>) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setIndex: number) => void;
  completeWorkout: () => void;
  deleteWorkout: (id: string) => void;

  addExercise: (name: string, split: Split, imageUrl?: string) => void;
  editExercise: (id: string, name: string) => void;
  deleteExercise: (id: string) => void;
}

const defaultExercises: Exercise[] = [
  // Push
  { id: 'push-1', name: 'Butterfly Machine', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop' },
  { id: 'push-2', name: 'Supine Press', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=200&h=200&fit=crop' },
  { id: 'push-3', name: 'Incline Press Machine', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=200&h=200&fit=crop' },
  { id: 'push-4', name: 'Vertical Chest Press', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=200&h=200&fit=crop' },
  { id: 'push-5', name: 'Shoulder Press', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=200&h=200&fit=crop' },
  { id: 'push-6', name: 'Lateral Raises', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=200&h=200&fit=crop' },
  { id: 'push-7', name: 'Triceps Cable Overhead', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=200&h=200&fit=crop' },
  { id: 'push-8', name: 'Triceps Push Down', split: 'Push', imageUrl: 'https://images.unsplash.com/photo-1590507621108-433608c97823?w=200&h=200&fit=crop' },
  // Pull
  { id: 'pull-1', name: 'Rear Delt Fly', split: 'Pull', imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=200&h=200&fit=crop' },
  { id: 'pull-2', name: 'Lat Pull Down', split: 'Pull', imageUrl: 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?w=200&h=200&fit=crop' },
  { id: 'pull-3', name: 'Seated Row', split: 'Pull', imageUrl: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=200&h=200&fit=crop' },
  { id: 'pull-4', name: 'Hammer Curl', split: 'Pull', imageUrl: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=200&h=200&fit=crop' },
  { id: 'pull-5', name: 'T-Bar Row', split: 'Pull', imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200&h=200&fit=crop' },
  { id: 'pull-6', name: 'Lateral Row Machine', split: 'Pull', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop' },
  { id: 'pull-7', name: 'Shrugs', split: 'Pull', imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop' },
  // Arms & Core
  { id: 'arms-1', name: 'Preacher Curl', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=200&h=200&fit=crop' },
  { id: 'arms-2', name: 'Wrist Curl', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=200&h=200&fit=crop' },
  { id: 'arms-3', name: 'Reverse Curl', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=200&h=200&fit=crop' },
  { id: 'arms-4', name: 'Incline Curl', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1585152968992-d2b9444408cc?w=200&h=200&fit=crop' },
  { id: 'arms-5', name: 'Torso Rotation', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' },
  { id: 'arms-6', name: 'Abdominal Machine', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=200&h=200&fit=crop' },
  { id: 'arms-7', name: 'General Abs', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop' },
  { id: 'arms-8', name: 'Leg Raises', split: 'Arms & Core', imageUrl: 'https://images.unsplash.com/photo-1616803689943-5601631c7fec?w=200&h=200&fit=crop' },
];

const createInitialWorkout = (): CurrentWorkout => ({
  date: new Date(),
  split: 'Push',
  cardio: { time: 0, distance: 0, calories: 0 },
  exercises: {},
});

export const useGymStore = create<GymState>()(
  persist(
    (set, get) => ({
      exercises: defaultExercises,
      workoutLogs: [],
      unitPreference: 'lbs',
      currentWorkout: createInitialWorkout(),

      setUnitPreference: (unit) => set({ unitPreference: unit }),

      setSplit: (split) =>
        set((state) => ({
          currentWorkout: { ...state.currentWorkout, split, exercises: {} },
        })),

      setDate: (date) =>
        set((state) => ({
          currentWorkout: { ...state.currentWorkout, date },
        })),

      updateCardio: (cardio) =>
        set((state) => ({
          currentWorkout: {
            ...state.currentWorkout,
            cardio: { ...state.currentWorkout.cardio, ...cardio },
          },
        })),

      updateSet: (exerciseId, setIndex, data) =>
        set((state) => {
          const sets = [...(state.currentWorkout.exercises[exerciseId] || [{ reps: 0, weight: 0 }])];
          sets[setIndex] = { ...sets[setIndex], ...data };
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: { ...state.currentWorkout.exercises, [exerciseId]: sets },
            },
          };
        }),

      addSet: (exerciseId) =>
        set((state) => {
          const sets = [...(state.currentWorkout.exercises[exerciseId] || [])];
          sets.push({ reps: 0, weight: 0 });
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: { ...state.currentWorkout.exercises, [exerciseId]: sets },
            },
          };
        }),

      removeSet: (exerciseId, setIndex) =>
        set((state) => {
          const sets = [...(state.currentWorkout.exercises[exerciseId] || [])];
          sets.splice(setIndex, 1);
          return {
            currentWorkout: {
              ...state.currentWorkout,
              exercises: { ...state.currentWorkout.exercises, [exerciseId]: sets },
            },
          };
        }),

      completeWorkout: () => {
        const state = get();
        const { currentWorkout, exercises: allExercises } = state;
        const splitExercises = allExercises.filter((e) => e.split === currentWorkout.split);

        const exerciseLogs: ExerciseLog[] = splitExercises
          .filter((e) => currentWorkout.exercises[e.id]?.some((s) => s.reps > 0))
          .map((e) => ({
            exerciseId: e.id,
            exerciseName: e.name,
            sets: currentWorkout.exercises[e.id] || [],
          }));

        const log: WorkoutLog = {
          id: Date.now().toString(),
          date: new Date(currentWorkout.date).toISOString(),
          split: currentWorkout.split,
          cardio: currentWorkout.cardio,
          exercises: exerciseLogs,
        };

        set({
          workoutLogs: [log, ...state.workoutLogs],
          currentWorkout: createInitialWorkout(),
        });
      },

      deleteWorkout: (id) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.filter((w) => w.id !== id),
        })),

      addExercise: (name, split, imageUrl) => {
        const id = `custom-${Date.now()}`;
        set((state) => ({
          exercises: [
            ...state.exercises,
            {
              id,
              name,
              split,
              imageUrl: imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
            },
          ],
        }));
      },

      editExercise: (id, name) =>
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, name } : e)),
        })),

      deleteExercise: (id) =>
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        })),
    }),
    {
      name: 'gym-tracker-storage',
      partialize: (state) => ({
        exercises: state.exercises,
        workoutLogs: state.workoutLogs,
        unitPreference: state.unitPreference,
      }),
    },
  ),
);
