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
  { id: 'push-1', name: 'Butterfly Machine', split: 'Push', imageUrl: 'https://fitnessdepot.pk/wp-content/uploads/2023/12/Tips-and-Tricks-to-Make-Use-of-Your-Butterfly-Machine-jpg.webp' },
  { id: 'push-2', name: 'Supine Press', split: 'Push', imageUrl: 'https://www.gymware.com/img/basic/total-chest-station-doing-supine-press.jpg' },
  { id: 'push-3', name: 'Incline Press ', split: 'Push', imageUrl: 'https://app-media.fitbod.me/v2/162/images/landscape/0_960x540.jpg' },
  { id: 'push-4', name: 'Vertical Chest Press', split: 'Push', imageUrl: 'https://www.panattagymequipment.com.au/wp-content/uploads/2020/05/pic-1mth033_03-700x700.jpg' },
  // Push
{ id: 'push-5', name: 'Shoulder Press', split: 'Push', imageUrl: 'https://gymgear.com/cdn/shop/articles/AdobeStock_29077846-scaled-4601848_6d1b52a1-9df4-426d-a160-b2c938ebfa0b-5067431.jpg?v=1767911052' },
{ id: 'push-6', name: 'Lateral Raises', split: 'Push', imageUrl: 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2019/06/Jeremy-Buendia-Lateral-Dumbbell-Raise.jpg?quality=86&strip=all' },
{ id: 'push-7', name: 'Triceps Cable Overhead', split: 'Push', imageUrl: 'https://i.ytimg.com/vi/1u18yJELsh0/maxresdefault.jpg' },
{ id: 'push-8', name: 'Triceps Push Down', split: 'Push', imageUrl: 'https://media.istockphoto.com/id/1342504639/photo/a-man-doing-triceps-pushdown-exercise-at-the-gym.jpg?s=612x612&w=0&k=20&c=bE74g7r9thVCwLSLcftp4nle-bWe2iOjs3_xL92tiIA=' },
// Pull
{ id: 'pull-1', name: 'Rear Delt Fly', split: 'Pull', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/machine-reverse-fly.jpg' },
{ id: 'pull-2', name: 'Lat Pull Down', split: 'Pull', imageUrl: '' },
{ id: 'pull-3', name: 'Seated Row', split: 'Pull', imageUrl: '' },
{ id: 'pull-4', name: 'Hammer Curl', split: 'Pull', imageUrl: '' },
{ id: 'pull-5', name: 'T-Bar Row', split: 'Pull', imageUrl: '' },
{ id: 'pull-6', name: 'Lateral Row Machine', split: 'Pull', imageUrl: '' },
{ id: 'pull-7', name: 'Shrugs', split: 'Pull', imageUrl: '' },
// Arms & Core
{ id: 'arms-1', name: 'Preacher Curl', split: 'Arms & Core', imageUrl: '' },
{ id: 'arms-2', name: 'Wrist Curl', split: 'Arms & Core', imageUrl: '' },
{ id: 'arms-3', name: 'Reverse Curl', split: 'Arms & Core', imageUrl: '' },
{ id: 'arms-4', name: 'Incline Curl', split: 'Arms & Core', imageUrl: '' },
{ id: 'arms-5', name: 'Torso Rotation', split: 'Arms & Core', imageUrl: '' },
{ id: 'arms-6', name: 'Abdominal Machine', split: 'Arms & Core', imageUrl: '' },
{ id: 'arms-7', name: 'General Abs', split: 'Arms & Core', imageUrl: '' },
{ id: 'arms-8', name: 'Leg Raises', split: 'Arms & Core', imageUrl: '' },
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
              imageUrl: imageUrl
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
