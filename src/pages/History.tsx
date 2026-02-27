import { format } from 'date-fns';
import { ChevronDown, Trash2, Activity, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymStore } from '@/store/useGymStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const History = () => {
  const { workoutLogs, deleteWorkout, unitPreference } = useGymStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 px-4 pt-4 max-w-lg mx-auto"
    >
      <h1 className="text-2xl font-bold tracking-tight mb-6">History</h1>

      <div className="space-y-3">
        {workoutLogs.map((log) => {
          const isExpanded = expandedId === log.id;
          const totalSets = log.exercises.reduce((a, e) => a + e.sets.length, 0);
          const totalVolume = log.exercises.reduce(
            (a, e) => a + e.sets.reduce((b, s) => b + s.reps * s.weight, 0),
            0,
          );

          return (
            <Card key={log.id} className="bg-card border-border overflow-hidden">
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
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
                        {totalVolume.toLocaleString()} {unitPreference}
                      </p>
                    </div>
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
                          <p className="text-xs font-semibold mb-2">{ex.exerciseName}</p>
                          <div className="space-y-1">
                            {ex.sets.map((s, i) => (
                              <div key={i} className="flex justify-between text-xs text-muted-foreground">
                                <span>Set {i + 1}</span>
                                <span>
                                  {s.reps} × {s.weight} {unitPreference}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Workout
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
