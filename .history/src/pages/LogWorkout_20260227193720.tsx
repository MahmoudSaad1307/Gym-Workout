import { format } from 'date-fns';
import { CalendarIcon, Plus, Minus, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useGymStore, type Split } from '@/store/useGymStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const splits: Split[] = ['Push', 'Pull', 'Arms & Core'];

const LogWorkout = () => {
  const {
    exercises,
    currentWorkout,
    unitPreference,
    setUnitPreference,
    setSplit,
    setDate,
    updateCardio,
    updateSet,
    addSet,
    removeSet,
    completeWorkout,
  } = useGymStore();

  const splitExercises = exercises.filter((e) => e.split === currentWorkout.split);

  const handleComplete = () => {
    completeWorkout();
    toast.success('Workout saved!', {
      description: `${currentWorkout.split} day logged successfully.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 px-4 pt-4 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Log Workout</h1>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">lbs</Label>
          <Switch
            checked={unitPreference === 'kgs'}
            onCheckedChange={(checked) => setUnitPreference(checked ? 'kgs' : 'lbs')}
            className="data-[state=checked]:bg-primary"
          />
          <Label className="text-xs text-muted-foreground">kgs</Label>
        </div>
      </div>

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left mb-4 bg-card border-border">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {format(new Date(currentWorkout.date), 'PPP')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={new Date(currentWorkout.date)}
            onSelect={(d) => d && setDate(d)}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Split Selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {splits.map((split) => (
          <button
            key={split}
            onClick={() => setSplit(split)}
            className={cn(
              'py-2.5 px-3 rounded-lg text-sm font-semibold transition-all',
              currentWorkout.split === split
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card text-muted-foreground border border-border hover:border-primary/50',
            )}
          >
            {split}
          </button>
        ))}
      </div>

      {/* Cardio Section */}
      <Card className="mb-6 bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Treadmill / Cardio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Time (min)</Label>
              <Input
                type="number"
                value={currentWorkout.cardio.time || ''}
                onChange={(e) => updateCardio({ time: Number(e.target.value) })}
                className="bg-secondary border-border h-9 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Dist (km)</Label>
              <Input
                type="number"
                step="0.1"
                value={currentWorkout.cardio.distance || ''}
                onChange={(e) => updateCardio({ distance: Number(e.target.value) })}
                className="bg-secondary border-border h-9 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Calories</Label>
              <Input
                type="number"
                value={currentWorkout.cardio.calories || ''}
                onChange={(e) => updateCardio({ calories: Number(e.target.value) })}
                className="bg-secondary border-border h-9 text-sm"
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWorkout.split}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {splitExercises.map((exercise) => {
            const sets = currentWorkout.exercises[exercise.id] || [{ reps: 0, weight: 0 }];
            return (
              <Card key={exercise.id} className="bg-card border-border overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <CardTitle className="text-sm font-semibold">{exercise.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Header row */}
                  <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-[10px] text-muted-foreground font-medium">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight ({unitPreference})</span>
                    <span></span>
                  </div>
                  {sets.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center"
                    >
                      <span className="text-xs text-muted-foreground text-center">{i + 1}</span>
                      <Input
                        type="number"
                        value={s.reps || ''}
                        onChange={(e) => updateSet(exercise.id, i, { reps: Number(e.target.value) })}
                        className="bg-secondary border-border h-8 text-sm"
                        placeholder="0"
                      />
                      <Input
                        type="number"
                        value={s.weight || ''}
                        onChange={(e) => updateSet(exercise.id, i, { weight: Number(e.target.value) })}
                        className="bg-secondary border-border h-8 text-sm"
                        placeholder="0"
                      />
                      <button
                        onClick={() => removeSet(exercise.id, i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addSet(exercise.id)}
                    className="w-full text-xs text-muted-foreground hover:text-primary"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Set
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        className="w-full mt-8 h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
      >
        Complete & Save Workout
      </Button>
    </motion.div>
  );
};

export default LogWorkout;
