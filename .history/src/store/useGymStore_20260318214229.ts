import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Split =
  | 'Push A'
  | 'Pull A'
  | 'Push B'
  | 'Pull B'
  | 'Home Workout'
  | 'Push'
  | 'Pull'
  | 'Arms & Core';
export type WeightUnit = 'lbs' | 'kgs';

export interface Exercise {
  id: string;
  name: string;
  split: Split;
  imageUrl: string;
  allSplits?: boolean;
}

export interface SetEntry {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  unit: WeightUnit;
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

export interface ProgressEntry {
  id: string;
  date: string; // ISO string
  weight: number;
  unit: WeightUnit;
  photoUrl: string;
  notes: string;
}

interface CurrentWorkout {
  date: Date;
  split: Split;
  cardio: CardioLog;
  exercises: Record<string, SetEntry[]>;
  exerciseUnits: Record<string, WeightUnit>;
}

interface GymState {
  exercises: Exercise[];
  workoutLogs: WorkoutLog[];
  progressEntries: ProgressEntry[];
  unitPreference: WeightUnit;
  currentWorkout: CurrentWorkout;

  setUnitPreference: (unit: WeightUnit) => void;
  setSplit: (split: Split) => void;
  setDate: (date: Date) => void;
  updateCardio: (cardio: Partial<CardioLog>) => void;
  updateSet: (exerciseId: string, setIndex: number, data: Partial<SetEntry>) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setIndex: number) => void;
  setExerciseUnit: (exerciseId: string, unit: WeightUnit) => void;
  completeWorkout: () => void;
  deleteWorkout: (id: string) => void;
  updateWorkoutLog: (logId: string, updatedExercises: ExerciseLog[], updatedCardio: CardioLog) => void;
  importWorkoutLogs: (logs: WorkoutLog[]) => void;

  addExercise: (name: string, split: Split, imageUrl?: string) => void;
  editExercise: (id: string, name: string) => void;
  deleteExercise: (id: string) => void;

  addProgressEntry: (entry: Omit<ProgressEntry, 'id'>) => void;
  editProgressEntry: (id: string, data: Partial<Omit<ProgressEntry, 'id'>>) => void;
  deleteProgressEntry: (id: string) => void;
}

const defaultExercises: Exercise[] = [
  // Push A
  { id: 'push-a-1', name: 'Incline Press', split: 'Push A', imageUrl: 'https://app-media.fitbod.me/v2/162/images/landscape/0_960x540.jpg' },
  { id: 'push-a-2', name: 'Shoulder Press', split: 'Push A', imageUrl: 'https://gymgear.com/cdn/shop/articles/AdobeStock_29077846-scaled-4601848_6d1b52a1-9df4-426d-a160-b2c938ebfa0b-5067431.jpg?v=1767911052' },
  { id: 'push-a-3', name: 'Lateral Raises', split: 'Push A', imageUrl: 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2019/06/Jeremy-Buendia-Lateral-Dumbbell-Raise.jpg?quality=86&strip=all' },
  { id: 'push-a-4', name: 'Preacher Curl', split: 'Push A', imageUrl: 'https://ozhelp.org.au/blog/wp-content/uploads/2025/02/Mastering-the-Preacher-Curl-A-Step-by-Step-Video-Guide.jpg' },
  { id: 'push-a-5', name: 'Reverse Curl', split: 'Push A', imageUrl: 'https://barbend.com/wp-content/uploads/2023/01/Barbend.com-Article-Image-760x427-Person-performing-a-reverse-bicep-curl.jpg' },
  { id: 'push-a-6', name: 'Triceps Cable Overhead', split: 'Push A', imageUrl: 'https://i.ytimg.com/vi/1u18yJELsh0/maxresdefault.jpg' },
  { id: 'push-a-7', name: 'Triceps Push Down', split: 'Push A', imageUrl: 'https://media.istockphoto.com/id/1342504639/photo/a-man-doing-triceps-pushdown-exercise-at-the-gym.jpg?s=612x612&w=0&k=20&c=bE74g7r9thVCwLSLcftp4nle-bWe2iOjs3_xL92tiIA=' },
  { id: 'push-a-8', name: 'Leg Raises', split: 'Push A', imageUrl: 'https://selectfitness.com/cdn/shop/files/body-solid-powerline-pvkc83x-vertical-knee-raise-leg-lifts.jpg?v=1715190829&width=2048' },
  // Pull A
  { id: 'pull-a-1', name: 'Lat Pull Down', split: 'Pull A', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/lat-pull-down.jpg' },
  { id: 'pull-a-2', name: 'Rear Delt Fly', split: 'Pull A', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/machine-reverse-fly.jpg' },
  { id: 'pull-a-3', name: 'Shrugs', split: 'Pull A', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/dumbbell-shrug.jpg' },
  { id: 'pull-a-4', name: 'Wrist Curl', split: 'Pull A', imageUrl: 'https://www.puregym.com/media/x3cpuyoz/wrist-flexion.jpg?quality=80' },
  { id: 'pull-a-5', name: 'Hammer Curl', split: 'Pull A', imageUrl: 'https://theenterpriseworld.com/wp-content/uploads/2025/03/1.-Hammer-Curls-Muscles-Workout-for-Bigger-Stronger-Arms-by-As-Images.jpg' },
  { id: 'pull-a-6', name: 'T-Bar Row', split: 'Pull A', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/t-bar-row.jpg' },
  // Push B
  { id: 'push-b-1', name: 'Vertical Chest Press (أو Supine Press)', split: 'Push B', imageUrl: 'https://www.panattagymequipment.com.au/wp-content/uploads/2020/05/pic-1mth033_03-700x700.jpg' },
  { id: 'push-b-2', name: 'Incline Curl', split: 'Push B', imageUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/106.gif' },
  { id: 'push-b-3', name: 'Preacher Curl', split: 'Push B', imageUrl: 'https://ozhelp.org.au/blog/wp-content/uploads/2025/02/Mastering-the-Preacher-Curl-A-Step-by-Step-Video-Guide.jpg' },
  { id: 'push-b-4', name: 'Butterfly Machine', split: 'Push B', imageUrl: 'https://fitnessdepot.pk/wp-content/uploads/2023/12/Tips-and-Tricks-to-Make-Use-of-Your-Butterfly-Machine-jpg.webp' },
  { id: 'push-b-5', name: 'Lateral Raises', split: 'Push B', imageUrl: 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2019/06/Jeremy-Buendia-Lateral-Dumbbell-Raise.jpg?quality=86&strip=all' },
  { id: 'push-b-6', name: 'Triceps Cable Overhead', split: 'Push B', imageUrl: 'https://i.ytimg.com/vi/1u18yJELsh0/maxresdefault.jpg' },
  { id: 'push-b-7', name: 'Triceps Push Down', split: 'Push B', imageUrl: 'https://media.istockphoto.com/id/1342504639/photo/a-man-doing-triceps-pushdown-exercise-at-the-gym.jpg?s=612x612&w=0&k=20&c=bE74g7r9thVCwLSLcftp4nle-bWe2iOjs3_xL92tiIA=' },
  { id: 'push-b-8', name: 'General Abs (Crunches)', split: 'Push B', imageUrl: 'https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2017/07/1109-ryan-terry-weighted-crunch-abs.jpg?quality=86&strip=all' },
  // Pull B
  { id: 'pull-b-1', name: 'Lat Pull Down', split: 'Pull B', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/lat-pull-down.jpg' },
  { id: 'pull-b-2', name: 'Hammer Curl', split: 'Pull B', imageUrl: 'https://theenterpriseworld.com/wp-content/uploads/2025/03/1.-Hammer-Curls-Muscles-Workout-for-Bigger-Stronger-Arms-by-As-Images.jpg' },
  { id: 'pull-b-3', name: 'Seated Row', split: 'Pull B', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/seated-cable-row.jpg' },
  { id: 'pull-b-4', name: 'Rear Delt Fly', split: 'Pull B', imageUrl: 'https://cdn.muscleandstrength.com/sites/default/files/machine-reverse-fly.jpg' },
  { id: 'pull-b-5', name: 'Reverse Curl', split: 'Pull B', imageUrl: 'https://barbend.com/wp-content/uploads/2023/01/Barbend.com-Article-Image-760x427-Person-performing-a-reverse-bicep-curl.jpg' },
  { id: 'pull-b-6', name: 'Wrist Curl', split: 'Pull B', imageUrl: 'https://www.puregym.com/media/x3cpuyoz/wrist-flexion.jpg?quality=80' },
  { id: 'pull-b-7', name: 'Leg Raises', split: 'Pull B', imageUrl: 'https://selectfitness.com/cdn/shop/files/body-solid-powerline-pvkc83x-vertical-knee-raise-leg-lifts.jpg?v=1715190829&width=2048' },
  // Home Workout
  { id: 'home-1', name: 'Push Up', split: 'Home Workout', imageUrl: 'https://fitnessfaqs.com/wp-content/uploads/2023/12/IMG_1170.jpg' },
  { id: 'home-2', name: 'Pull Up', split: 'Home Workout', imageUrl: 'https://cdn.centr.com/content/35000/34447/images/landscapemobile3x-header-lz-pullupbar-169.jpg' },
  { id: 'home-3', name: 'Hand Gripper', split: 'Home Workout', imageUrl: 'https://www.mecastrong.com/wp-content/uploads/2026/02/Grip-strength-training-with-hand-grippers.webp' },
  { id: 'home-4', name: 'Bodyweight Squat', split: 'Home Workout', imageUrl: 'https://hips.hearstapps.com/hmg-prod/images/man-exercising-at-home-royalty-free-image-1645047847.jpg?resize=980:*' },
  { id: 'home-5', name: 'Plank Hold', split: 'Home Workout', imageUrl: 'https://gymnation.com/media/jpbjzofv/plank2.webp?width=956&height=675&v=1dc68400a14c040' },
  // { id: 'home-6', name: 'Mountain Climbers', split: 'Home Workout', imageUrl: '' },
];

const createInitialWorkout = (): CurrentWorkout => ({
  date: new Date(),
  split: 'Push A',
  cardio: { time: 0, distance: 0, calories: 0 },
  exercises: {},
  exerciseUnits: {},
});

export const useGymStore = create<GymState>()(
  persist(
    (set, get) => ({
      exercises: defaultExercises,
      workoutLogs: [],
      progressEntries: [],
      unitPreference: 'lbs',
      currentWorkout: createInitialWorkout(),

      setUnitPreference: (unit) => set({ unitPreference: unit }),

      setSplit: (split) =>
        set((state) => ({
          currentWorkout: { ...state.currentWorkout, split, exercises: {}, exerciseUnits: {} },
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

      setExerciseUnit: (exerciseId, unit) =>
        set((state) => ({
          currentWorkout: {
            ...state.currentWorkout,
            exerciseUnits: { ...state.currentWorkout.exerciseUnits, [exerciseId]: unit },
          },
        })),

      completeWorkout: () => {
        const state = get();
        const { currentWorkout, exercises: allExercises } = state;
        const splitExercises = allExercises.filter((e) =>
          currentWorkout.split === 'Home Workout' ? e.split === 'Home Workout' : e.split === currentWorkout.split || e.allSplits,
        );

        const exerciseLogs: ExerciseLog[] = splitExercises
          .filter((e) => currentWorkout.exercises[e.id]?.some((s) => s.reps > 0))
          .map((e) => ({
            exerciseId: e.id,
            exerciseName: e.name,
            unit: currentWorkout.exerciseUnits[e.id] ?? state.unitPreference,
            sets: currentWorkout.exercises[e.id] || [],
          }));

        const cardioInKm = {
          ...currentWorkout.cardio,
          distance: Math.round(currentWorkout.cardio.distance * 1.60934 * 100) / 100,
        };

        const log: WorkoutLog = {
          id: Date.now().toString(),
          date: new Date(currentWorkout.date).toISOString(),
          split: currentWorkout.split,
          cardio: cardioInKm,
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

      updateWorkoutLog: (logId, updatedExercises, updatedCardio) => {
        const cardioInKm = {
          ...updatedCardio,
          distance: Math.round(updatedCardio.distance * 1.60934 * 100) / 100,
        };
        set((state) => ({
          workoutLogs: state.workoutLogs.map((w) =>
            w.id === logId ? { ...w, exercises: updatedExercises, cardio: cardioInKm } : w
          ),
        }));
      },

      importWorkoutLogs: (logs) =>
        set((state) => ({
          workoutLogs: [...logs, ...state.workoutLogs],
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
              imageUrl: imageUrl ?? '',
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

      addProgressEntry: (entry) => {
        const id = `progress-${Date.now()}`;
        set((state) => ({
          progressEntries: [{ id, ...entry }, ...state.progressEntries],
        }));
      },

      editProgressEntry: (id, data) =>
        set((state) => ({
          progressEntries: state.progressEntries.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        })),

      deleteProgressEntry: (id) =>
        set((state) => ({
          progressEntries: state.progressEntries.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'gym-tracker-storage',
      version: 3,
      partialize: (state) => ({
        exercises: state.exercises,
        workoutLogs: state.workoutLogs,
        progressEntries: state.progressEntries,
        unitPreference: state.unitPreference,
      }),
      migrate: (persisted: unknown, version: number) => {
        const next = (persisted && typeof persisted === 'object' ? persisted : {}) as {
          exercises?: Exercise[];
        };
        const persistedExercises = Array.isArray(next.exercises) ? next.exercises : [];
        if (version <= 2) {
          const customExercises = persistedExercises.filter(
            (exercise: Exercise) => typeof exercise.id === 'string' && exercise.id.startsWith('custom-'),
          );
          next.exercises = [...defaultExercises, ...customExercises];
          return next;
        }

        const allSplitsMap = new Map(defaultExercises.filter((e) => e.allSplits).map((e) => [e.id, true]));
        next.exercises = persistedExercises.map((e) => ({
          ...e,
          allSplits: allSplitsMap.get(e.id) || e.allSplits || undefined,
        }));

        return next;
      },
    },
  ),
);
