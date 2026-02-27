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
  { id: 'push-3', name: 'Incline Press Machine', split: 'Push', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/11666039314114242531' },
  { id: 'push-4', name: 'Vertical Chest Press', split: 'Push', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/8690562374021627460' },
  { id: 'push-5', name: 'Shoulder Press', split: 'Push', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/18372386814562634091' },
  { id: 'push-6', name: 'Lateral Raises', split: 'Push', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/6966617938919976819' },
  { id: 'push-7', name: 'Triceps Cable Overhead', split: 'Push', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/16768038740089059343' },
  { id: 'push-8', name: 'Triceps Push Down', split: 'Push', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/553012210350785414' },
  // Pull
  { id: 'pull-1', name: 'Rear Delt Fly', split: 'Pull', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/5305521340661380889' },
  { id: 'pull-2', name: 'Lat Pull Down', split: 'Pull', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/16852676692605633226' },
  { id: 'pull-3', name: 'Seated Row', split: 'Pull', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/4042378872967117163' },
  { id: 'pull-4', name: 'Hammer Curl', split: 'Pull', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/6966617938919974404' },
  { id: 'pull-5', name: 'T-Bar Row', split: 'Pull', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/17005033494827302692' },
  { id: 'pull-6', name: 'Lateral Row Machine', split: 'Pull', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/15580995812413795504' },
  { id: 'pull-7', name: 'Shrugs', split: 'Pull', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/18372386814562631929' },
  // Arms & Core
  { id: 'arms-1', name: 'Preacher Curl', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/15132711311030516352' },
  { id: 'arms-2', name: 'Wrist Curl', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/6192099620435600305' },
  { id: 'arms-3', name: 'Reverse Curl', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/1157906197333218878' },
  { id: 'arms-4', name: 'Incline Curl', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/4012726904574410161' },
  { id: 'arms-5', name: 'Torso Rotation', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/1277230130813962105' },
  { id: 'arms-6', name: 'Abdominal Machine', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/11666039314114242936' },
  { id: 'arms-7', name: 'General Abs', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/12302077859403639833' },
  { id: 'arms-8', name: 'Leg Raises', split: 'Arms & Core', imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/1298816748182176126' },
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
