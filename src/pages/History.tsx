import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useGymStore, type CardioLog, type ExerciseLog, type Split, type WeightUnit, type WorkoutLog } from '@/store/useGymStore';
import { format, isValid, parse } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Check, ChevronDown, Download, Dumbbell, Minus, Pencil, Plus, Trash2, Upload, X } from 'lucide-react';
import { useState } from 'react';

// Deep clone helper
function cloneExercises(exercises: ExerciseLog[]): ExerciseLog[] {
  return exercises.map((ex) => ({
    ...ex,
    sets: ex.sets.map((s) => ({ ...s })),
  }));
}

const validSplits: Split[] = ['Push', 'Pull', 'Arms & Core', 'Home Workout'];

const getExerciseInputMode = (name: string) => {
  const n = name.trim().toLowerCase();
  if (n.includes('plank')) return 'duration' as const;
  if (
    n.includes('push up') ||
    n.includes('pull up') ||
    n.includes('squat') ||
    n.includes('mountain climber')
  ) {
    return 'reps_only' as const;
  }
  return 'reps_weight' as const;
};

function parseHistoryExport(text: string): WorkoutLog[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd());
  const detailsIndex = lines.findIndex((line) => line.trim() === 'DETAILS');
  if (detailsIndex === -1) {
    throw new Error('Missing DETAILS section');
  }

  const importedLogs: WorkoutLog[] = [];
  let currentLog: WorkoutLog | null = null;
  let currentExercise: ExerciseLog | null = null;

  const pushExercise = () => {
    if (!currentLog || !currentExercise) return;
    currentLog.exercises.push(currentExercise);
    currentExercise = null;
  };

  const pushLog = () => {
    if (!currentLog) return;
    pushExercise();
    importedLogs.push(currentLog);
    currentLog = null;
  };

  for (let i = detailsIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) continue;

    const workoutMatch = line.match(/^#\d+\s(.+?)\s-\s(.+)\sDay$/);
    if (workoutMatch) {
      pushLog();
      const dateText = workoutMatch[1].trim();
      const splitText = workoutMatch[2].trim();
      if (!validSplits.includes(splitText as Split)) {
        throw new Error(`Invalid split: ${splitText}`);
      }
      const parsedDate = parse(dateText, 'EEEE, MMM d, yyyy', new Date());
      const fallbackDate = new Date(dateText);
      const resolvedDate = isValid(parsedDate) ? parsedDate : fallbackDate;
      if (!isValid(resolvedDate)) {
        throw new Error(`Invalid date: ${dateText}`);
      }
      currentLog = {
        id: `import-${Date.now()}-${importedLogs.length}`,
        date: resolvedDate.toISOString(),
        split: splitText as Split,
        cardio: { time: 0, distance: 0, calories: 0 },
        exercises: [],
      };
      continue;
    }

    if (!currentLog) {
      continue;
    }

    const cardioMatch = line.match(/^Cardio:\s([\d.]+)\smin\s\|\s([\d.]+)\skm\s\|\s([\d.]+)\scal$/);
    if (cardioMatch) {
      currentLog.cardio = {
        time: Number(cardioMatch[1]),
        distance: Number(cardioMatch[2]),
        calories: Number(cardioMatch[3]),
      };
      continue;
    }

    const exerciseMatch = line.match(/^ {2}(.+)\s\((lbs|kgs)\)$/);
    if (exerciseMatch) {
      pushExercise();
      const exerciseName = exerciseMatch[1].trim();
      const unit = exerciseMatch[2] as WeightUnit;
      currentExercise = {
        exerciseId: `${exerciseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${currentLog.exercises.length}`,
        exerciseName,
        unit,
        sets: [],
      };
      continue;
    }

    const setRepsWeightMatch = line.match(/^ {4}Set\s\d+:\s([\d.]+)\sreps\s[×x]\s([\d.]+)\s(lbs|kgs)$/);
    if (setRepsWeightMatch && currentExercise) {
      currentExercise.sets.push({
        reps: Number(setRepsWeightMatch[1]),
        weight: Number(setRepsWeightMatch[2]),
      });
      continue;
    }

    const setRepsOnlyMatch = line.match(/^ {4}Set\s\d+:\s([\d.]+)\sreps$/);
    if (setRepsOnlyMatch && currentExercise) {
      currentExercise.sets.push({
        reps: Number(setRepsOnlyMatch[1]),
        weight: 0,
      });
      continue;
    }

    const setDurationMatch = line.match(/^ {4}Set\s\d+:\s([\d.]+)\ssec$/);
    if (setDurationMatch && currentExercise) {
      currentExercise.sets.push({
        reps: Number(setDurationMatch[1]),
        weight: 0,
      });
      continue;
    }

    const exerciseMatchNoUnit = line.match(/^ {2}(?! {2})(.+)$/);
    if (exerciseMatchNoUnit) {
      pushExercise();
      const exerciseName = exerciseMatchNoUnit[1].trim();
      currentExercise = {
        exerciseId: `${exerciseName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${currentLog.exercises.length}`,
        exerciseName,
        unit: 'lbs',
        sets: [],
      };
    }
  }

  pushLog();

  if (importedLogs.length === 0) {
    throw new Error('No workout entries found');
  }

  return importedLogs;
}

const History = () => {
  const { workoutLogs, deleteWorkout, updateWorkoutLog, importWorkoutLogs, exercises: allExercises } = useGymStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  // Draft state for the workout being edited
  const [draftExercises, setDraftExercises] = useState<ExerciseLog[]>([]);
  const [draftCardio, setDraftCardio] = useState<CardioLog>({ time: 0, distance: 0, calories: 0 });

  const startEdit = (logId: string) => {
    const log = workoutLogs.find((w) => w.id === logId);
    if (!log) return;
    setDraftExercises(cloneExercises(log.exercises));
    setDraftCardio({
      ...log.cardio,
      distance: Math.round((log.cardio.distance / 1.60934) * 100) / 100, // km → miles for editing
    });
    setEditingId(logId);
    setExpandedId(logId);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftExercises([]);
    setDraftCardio({ time: 0, distance: 0, calories: 0 });
  };

  const saveEdit = (logId: string) => {
    updateWorkoutLog(logId, draftExercises, draftCardio);
    cancelEdit();
  };

  const updateDraftSet = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: number) => {
    setDraftExercises((prev) => {
      const next = cloneExercises(prev);
      next[exIdx].sets[setIdx][field] = value;
      return next;
    });
  };

  const addDraftSet = (exIdx: number) => {
    setDraftExercises((prev) => {
      const next = cloneExercises(prev);
      next[exIdx].sets.push({ reps: 0, weight: 0 });
      return next;
    });
  };

  const removeDraftSet = (exIdx: number, setIdx: number) => {
    setDraftExercises((prev) => {
      const next = cloneExercises(prev);
      next[exIdx].sets.splice(setIdx, 1);
      return next;
    });
  };

  const setDraftExerciseUnit = (exIdx: number, unit: WeightUnit) => {
    setDraftExercises((prev) => {
      const next = cloneExercises(prev);
      next[exIdx].unit = unit;
      return next;
    });
  };

  const getAvailableExercises = (split: string) => {
    return allExercises
      .filter((e) => (split === 'Home Workout' ? e.split === 'Home Workout' : e.split === split || e.allSplits))
      .filter((e) => !draftExercises.some((d) => d.exerciseId === e.id));
  };

  const addDraftExercise = (exerciseId: string) => {
    const exercise = allExercises.find((e) => e.id === exerciseId);
    if (!exercise) return;
    setDraftExercises((prev) => [
      ...prev,
      { exerciseId: exercise.id, exerciseName: exercise.name, unit: 'lbs', sets: [{ reps: 0, weight: 0 }] },
    ]);
  };

  const removeDraftExercise = (exIdx: number) => {
    setDraftExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const exportHistory = () => {
    const totalWorkouts = workoutLogs.length;
    const totalSets = workoutLogs.reduce((acc, log) => acc + log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0), 0);
    const totalVolume = workoutLogs.reduce(
      (acc, log) => acc + log.exercises.reduce((sum, ex) => sum + ex.sets.reduce((setSum, s) => setSum + s.reps * s.weight, 0), 0),
      0,
    );

    const formatSetLine = (exercise: ExerciseLog, setEntry: { reps: number; weight: number }, setIndex: number) => {
      const mode = getExerciseInputMode(exercise.exerciseName);
      if (mode === 'duration') return `    Set ${setIndex + 1}: ${setEntry.reps} sec`;
      if (mode === 'reps_only') return `    Set ${setIndex + 1}: ${setEntry.reps} reps`;
      return `    Set ${setIndex + 1}: ${setEntry.reps} reps × ${setEntry.weight} ${exercise.unit ?? 'lbs'}`;
    };

    const content = [
      'WORKOUT HISTORY EXPORT',
      `Generated: ${format(new Date(), 'PPpp')}`,
      '',
      'SUMMARY',
      `- Total workouts: ${totalWorkouts}`,
      `- Total sets: ${totalSets}`,
      `- Total volume: ${totalVolume.toLocaleString()}`,
      '',
      'DETAILS',
      ...workoutLogs.flatMap((log, index) => {
        const logSetCount = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const logVolume = log.exercises.reduce(
          (sum, ex) => sum + ex.sets.reduce((setSum, setEntry) => setSum + setEntry.reps * setEntry.weight, 0),
          0,
        );

        return [
          `#${index + 1} ${format(new Date(log.date), 'EEEE, MMM d, yyyy')} - ${log.split} Day`,
          `Cardio: ${log.cardio.time} min | ${log.cardio.distance} km | ${log.cardio.calories} cal`,
          `Total sets: ${logSetCount} | Total volume: ${logVolume.toLocaleString()}`,
          ...log.exercises.flatMap((ex) => {
            const mode = getExerciseInputMode(ex.exerciseName);
            return [
              mode === 'reps_weight' ? `  ${ex.exerciseName} (${ex.unit ?? 'lbs'})` : `  ${ex.exerciseName}`,
              ...ex.sets.map((setEntry, setIndex) => formatSetLine(ex, setEntry, setIndex)),
            ];
          }),
          '',
        ];
      }),
    ].join('\n');

    const fileName = `workout-history-${format(new Date(), 'yyyy-MM-dd-HHmm')}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('History exported', {
      description: `${totalWorkouts} workouts saved to ${fileName}`,
    });
  };

  const importHistory = () => {
    try {
      const imported = parseHistoryExport(importText);
      importWorkoutLogs(imported);
      setImportText('');
      setImportOpen(false);
      setExpandedId(imported[0]?.id ?? null);
      setEditingId(null);
      toast.success('History imported', {
        description: `${imported.length} workouts added from text`,
      });
    } catch (error) {
      toast.error('Import failed', {
        description: error instanceof Error ? error.message : 'Invalid history format',
      });
    }
  };

  if (workoutLogs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-24 px-4 pt-4 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]"
      >
        <Dumbbell className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-muted-foreground">No workouts yet</h2>
        <p className="text-sm text-muted-foreground/60">Complete your first workout to see it here.</p>
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4">
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Import History
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import History</DialogTitle>
              <DialogDescription>Paste previously exported history text to restore workouts.</DialogDescription>
            </DialogHeader>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="min-h-[260px] font-mono text-xs"
              placeholder="Paste full exported text here..."
            />
            <DialogFooter>
              <Button
                onClick={importHistory}
                disabled={!importText.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Import Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 px-4 pt-4 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <div className="flex items-center gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0">
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import History</DialogTitle>
                <DialogDescription>Paste previously exported history text to restore workouts.</DialogDescription>
              </DialogHeader>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="min-h-[260px] font-mono text-xs"
                placeholder="Paste full exported text here..."
              />
              <DialogFooter>
                <Button
                  onClick={importHistory}
                  disabled={!importText.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Import Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={exportHistory} className="shrink-0">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {workoutLogs.map((log) => {
          const isExpanded = expandedId === log.id;
          const isEditing = editingId === log.id;
          const totalSets = log.exercises.reduce((a, e) => a + e.sets.length, 0);
          const totalVolume = log.exercises.reduce(
            (a, e) => a + e.sets.reduce((b, s) => b + s.reps * s.weight, 0),
            0,
          );

          return (
            <Card key={log.id} className="bg-card border-border overflow-hidden">
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => !isEditing && setExpandedId(isExpanded ? null : log.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.date), 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="font-semibold text-sm mt-0.5">{log.split} Day</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">{totalSets} sets</p>
                      <p className="text-[10px] text-muted-foreground">
                        {totalVolume.toLocaleString()} total vol
                      </p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(log.id);
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        aria-label="Edit workout"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CardContent className="pt-0 space-y-3">
                      {/* ---- VIEW MODE ---- */}
                      {!isEditing && (
                        <>
                          {/* Cardio */}
                          {(log.cardio.time > 0 || log.cardio.distance > 0 || log.cardio.calories > 0) && (
                            <div className="bg-secondary rounded-lg p-3">
                              <p className="text-xs font-medium flex items-center gap-1.5 mb-2">
                                <Activity className="w-3.5 h-3.5 text-primary" /> Cardio
                              </p>
                              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <span>{log.cardio.time} min</span>
                                <span>{log.cardio.distance} km</span>
                                <span>{log.cardio.calories} cal</span>
                              </div>
                            </div>
                          )}

                          {/* Exercises */}
                          {log.exercises.map((ex) => (
                            <div key={ex.exerciseId} className="bg-secondary rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold">{ex.exerciseName}</p>
                                {getExerciseInputMode(ex.exerciseName) === 'reps_weight' && (
                                  <span className="text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-bold">
                                    {ex.unit ?? 'lbs'}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                {ex.sets.map((s, i) => (
                                  <div key={i} className="flex justify-between text-xs text-muted-foreground">
                                    <span>Set {i + 1}</span>
                                    <span>
                                      {getExerciseInputMode(ex.exerciseName) === 'duration'
                                        ? `${s.reps} sec`
                                        : getExerciseInputMode(ex.exerciseName) === 'reps_only'
                                          ? `${s.reps} reps`
                                          : `${s.reps} × ${s.weight} ${ex.unit ?? 'lbs'}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-primary hover:text-primary/80"
                              onClick={() => startEdit(log.id)}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Workout
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteWorkout(log.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      )}

                      {/* ---- EDIT MODE ---- */}
                      {isEditing && (
                        <div className="space-y-3">
                          {/* Edit Cardio */}
                          <div className="bg-secondary rounded-lg p-3">
                            <p className="text-xs font-medium flex items-center gap-1.5 mb-3">
                              <Activity className="w-3.5 h-3.5 text-primary" /> Cardio
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {(['time', 'distance', 'calories'] as const).map((field) => (
                                <div key={field}>
                                  <p className="text-[10px] text-muted-foreground mb-1 capitalize">
                                    {field === 'time' ? 'Time (min)' : field === 'distance' ? 'Dist (miles)' : 'Cal'}
                                  </p>
                                  <Input
                                    type="number"
                                    value={draftCardio[field] || ''}
                                    onChange={(e) =>
                                      setDraftCardio((prev) => ({ ...prev, [field]: Number(e.target.value) }))
                                    }
                                    className="bg-background border-border h-8 text-xs"
                                    placeholder="0"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Edit Exercises */}
                          {draftExercises.map((ex, exIdx) => (
                            <div key={ex.exerciseId} className="bg-secondary rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold">{ex.exerciseName}</p>
                                  <button
                                    onClick={() => removeDraftExercise(exIdx)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                    aria-label="Remove exercise"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                {/* Unit toggle per exercise */}
                                {getExerciseInputMode(ex.exerciseName) === 'reps_weight' && (
                                  <div className="flex items-center gap-0.5 bg-background rounded-lg p-0.5">
                                    {(['lbs', 'kgs'] as WeightUnit[]).map((u) => (
                                      <button
                                        key={u}
                                        onClick={() => setDraftExerciseUnit(exIdx, u)}
                                        className={cn(
                                          'px-2 py-0.5 rounded-md text-[10px] font-bold transition-all',
                                          (ex.unit ?? 'lbs') === u
                                            ? 'bg-primary text-primary-foreground shadow'
                                            : 'text-muted-foreground hover:text-foreground',
                                        )}
                                      >
                                        {u}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Column headers */}
                              {getExerciseInputMode(ex.exerciseName) === 'reps_weight' && (
                                <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-[10px] text-muted-foreground font-medium">
                                  <span>Set</span>
                                  <span>Reps</span>
                                  <span>Weight ({ex.unit ?? 'lbs'})</span>
                                  <span></span>
                                </div>
                              )}
                              {getExerciseInputMode(ex.exerciseName) !== 'reps_weight' && (
                                <div className="grid grid-cols-[2rem_1fr_2rem] gap-2 text-[10px] text-muted-foreground font-medium">
                                  <span>Set</span>
                                  <span>{getExerciseInputMode(ex.exerciseName) === 'duration' ? 'Duration (sec)' : 'Reps'}</span>
                                  <span></span>
                                </div>
                              )}

                              {ex.sets.map((s, setIdx) => (
                                <div
                                  key={setIdx}
                                  className={cn(
                                    'gap-2 items-center',
                                    getExerciseInputMode(ex.exerciseName) === 'reps_weight'
                                      ? 'grid grid-cols-[2rem_1fr_1fr_2rem]'
                                      : 'grid grid-cols-[2rem_1fr_2rem]',
                                  )}
                                >
                                  <span className="text-xs text-muted-foreground text-center">{setIdx + 1}</span>
                                  <Input
                                    type="number"
                                    value={s.reps || ''}
                                    onChange={(e) => updateDraftSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                                    className="bg-background border-border h-8 text-xs"
                                    placeholder="0"
                                  />
                                  {getExerciseInputMode(ex.exerciseName) === 'reps_weight' && (
                                    <Input
                                      type="number"
                                      value={s.weight || ''}
                                      onChange={(e) => updateDraftSet(exIdx, setIdx, 'weight', Number(e.target.value))}
                                      className="bg-background border-border h-8 text-xs"
                                      placeholder="0"
                                    />
                                  )}
                                  <button
                                    onClick={() => removeDraftSet(exIdx, setIdx)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}

                              <button
                                onClick={() => addDraftSet(exIdx)}
                                className="w-full text-[10px] text-muted-foreground hover:text-primary flex items-center justify-center gap-1 py-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" /> Add Set
                              </button>
                            </div>
                          ))}

                          {/* Add Exercise */}
                          {(() => {
                            const available = getAvailableExercises(log.split);
                            if (available.length === 0) return null;
                            return (
                              <div className="bg-secondary rounded-lg p-3">
                                <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                                  <Plus className="w-3.5 h-3.5 text-primary" /> Add Exercise
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {available.map((ex) => (
                                    <button
                                      key={ex.id}
                                      onClick={() => addDraftExercise(ex.id)}
                                      className="text-[10px] bg-background hover:bg-primary/10 hover:text-primary border border-border rounded-md px-2 py-1 transition-colors"
                                    >
                                      {ex.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Save / Cancel */}
                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => saveEdit(log.id)}
                            >
                              <Check className="w-3.5 h-3.5 mr-1.5" /> Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={cancelEdit}
                            >
                              <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

export default History;
