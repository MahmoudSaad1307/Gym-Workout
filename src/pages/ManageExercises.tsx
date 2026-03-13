import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymStore, type Split } from '@/store/useGymStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';

const splits: Split[] = ['Push', 'Pull', 'Arms & Core', 'Home Workout'];

const ManageExercises = () => {
  const { exercises, addExercise, editExercise, deleteExercise } = useGymStore();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSplit, setNewSplit] = useState<Split>('Push');
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addExercise(newName.trim(), newSplit);
    setNewName('');
    setAddOpen(false);
  };

  const openEdit = (id: string, name: string) => {
    setEditId(id);
    setEditName(name);
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editName.trim()) return;
    editExercise(editId, editName.trim());
    setEditOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 px-4 pt-4 max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs mb-1.5 block">Exercise Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Bench Press" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Split</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {splits.map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewSplit(s)}
                      className={cn(
                        'py-2 rounded-lg text-xs font-semibold transition-all',
                        newSplit === s
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground border border-border',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
                Add Exercise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-xs mb-1.5 block">Exercise Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handleEdit} className="bg-primary hover:bg-primary/90">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Lists */}
      {splits.map((split) => {
        const splitExercises = exercises.filter((e) => e.split === split);
        return (
          <Card key={split} className="bg-card border-border mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-primary">{split}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <AnimatePresence>
                {splitExercises.map((ex) => (
                  <motion.div
                    key={ex.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <img
                      src={ex.imageUrl}
                      alt={ex.name}
                      className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <span className="text-sm flex-1">{ex.name}</span>
                    <button
                      onClick={() => openEdit(ex.id, ex.name)}
                      className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{ex.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>This will remove the exercise permanently.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteExercise(ex.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        );
      })}
    </motion.div>
  );
};

export default ManageExercises;
