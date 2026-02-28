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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useGymStore, type WeightUnit } from '@/store/useGymStore';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, ChevronDown, Pencil, Plus, Scale, Trash2, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

const Progress = () => {
  const { progressEntries, addProgressEntry, editProgressEntry, deleteProgressEntry, unitPreference } = useGymStore();

  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New entry form state
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
    unit: unitPreference as WeightUnit,
    photoUrl: '',
    notes: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    date: '',
    weight: '',
    unit: 'lbs' as WeightUnit,
    photoUrl: '',
    notes: '',
  });

  const resetForm = () =>
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), weight: '', unit: unitPreference, photoUrl: '', notes: '' });

  const handleAdd = () => {
    if (!form.weight) return;
    addProgressEntry({
      date: new Date(form.date).toISOString(),
      weight: Number(form.weight),
      unit: form.unit,
      photoUrl: form.photoUrl.trim(),
      notes: form.notes.trim(),
    });
    resetForm();
    setAddOpen(false);
  };

  const startEdit = (id: string) => {
    const entry = progressEntries.find((p) => p.id === id);
    if (!entry) return;
    setEditForm({
      date: format(new Date(entry.date), 'yyyy-MM-dd'),
      weight: String(entry.weight),
      unit: entry.unit,
      photoUrl: entry.photoUrl,
      notes: entry.notes,
    });
    setEditingId(id);
    setExpandedId(id);
  };

  const saveEdit = (id: string) => {
    editProgressEntry(id, {
      date: new Date(editForm.date).toISOString(),
      weight: Number(editForm.weight),
      unit: editForm.unit,
      photoUrl: editForm.photoUrl.trim(),
      notes: editForm.notes.trim(),
    });
    setEditingId(null);
  };

  // Compute weight change trend
  const sorted = [...progressEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const latest = sorted[sorted.length - 1];
  const earliest = sorted[0];
  const weightDelta =
    sorted.length >= 2 ? latest.weight - earliest.weight : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24 px-4 pt-4 max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="w-4 h-4" /> Log Week
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Log Weekly Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Date */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>

              {/* Weight + unit */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Body Weight</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    className="bg-secondary border-border flex-1"
                    placeholder="0.0"
                  />
                  <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
                    {(['lbs', 'kgs'] as WeightUnit[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setForm((f) => ({ ...f, unit: u }))}
                        className={cn(
                          'px-2.5 py-1.5 rounded-md text-xs font-bold transition-all',
                          form.unit === u
                            ? 'bg-primary text-primary-foreground shadow'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo URL */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Photo Link (optional)
                </Label>
                <Input
                  type="url"
                  value={form.photoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                  className="bg-secondary border-border"
                  placeholder="https://..."
                />
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Notes (optional)</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="bg-secondary border-border"
                  placeholder="How are you feeling?"
                />
              </div>

              <Button
                onClick={handleAdd}
                disabled={!form.weight}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary strip */}
      {sorted.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center">
            <Scale className="w-4 h-4 text-primary mb-1" />
            <p className="text-lg font-bold">
              {latest.weight}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">{latest.unit}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">Current</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center">
            <TrendingUp className="w-4 h-4 text-primary mb-1" />
            <p className={cn('text-lg font-bold', weightDelta !== null && weightDelta < 0 ? 'text-green-500' : 'text-orange-400')}>
              {weightDelta !== null ? (weightDelta > 0 ? '+' : '') + weightDelta.toFixed(1) : '—'}
            </p>
            <p className="text-[10px] text-muted-foreground">Change</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 flex flex-col items-center">
            <p className="text-lg font-bold">{progressEntries.length}</p>
            <p className="text-[10px] text-muted-foreground">Entries</p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {progressEntries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[50vh]"
        >
          <Scale className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-muted-foreground">No entries yet</h2>
          <p className="text-sm text-muted-foreground/60">Tap "Log Week" to track your progress.</p>
        </motion.div>
      )}

      {/* Entries list */}
      <div className="space-y-3">
        {progressEntries.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const isEditing = editingId === entry.id;

          return (
            <Card key={entry.id} className="bg-card border-border overflow-hidden">
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => !isEditing && setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.date), 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="font-bold text-sm mt-0.5">
                      {entry.weight} {entry.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(entry.id);
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        aria-label="Edit entry"
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
                      {/* VIEW MODE */}
                      {!isEditing && (
                        <>
                          {entry.photoUrl && (
                            <a
                              href={entry.photoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={entry.photoUrl}
                                alt="Progress photo"
                                className="w-full rounded-xl object-cover max-h-64 border border-border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </a>
                          )}
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground bg-secondary rounded-lg p-2.5">
                              {entry.notes}
                            </p>
                          )}
                          {!entry.photoUrl && !entry.notes && (
                            <p className="text-xs text-muted-foreground/50 text-center py-1">No photo or notes added.</p>
                          )}
                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 text-primary hover:text-primary/80"
                              onClick={() => startEdit(entry.id)}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive">
                                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProgressEntry(entry.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </>
                      )}

                      {/* EDIT MODE */}
                      {isEditing && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-[10px] text-muted-foreground mb-1 block">Date</Label>
                            <Input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                              className="bg-secondary border-border h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground mb-1 block">Body Weight</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={editForm.weight}
                                onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                                className="bg-secondary border-border h-8 text-xs flex-1"
                                placeholder="0.0"
                              />
                              <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
                                {(['lbs', 'kgs'] as WeightUnit[]).map((u) => (
                                  <button
                                    key={u}
                                    onClick={() => setEditForm((f) => ({ ...f, unit: u }))}
                                    className={cn(
                                      'px-2 py-0.5 rounded-md text-[10px] font-bold transition-all',
                                      editForm.unit === u
                                        ? 'bg-primary text-primary-foreground shadow'
                                        : 'text-muted-foreground hover:text-foreground',
                                    )}
                                  >
                                    {u}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground mb-1 block flex items-center gap-1">
                              <Camera className="w-3 h-3" /> Photo Link
                            </Label>
                            <Input
                              type="url"
                              value={editForm.photoUrl}
                              onChange={(e) => setEditForm((f) => ({ ...f, photoUrl: e.target.value }))}
                              className="bg-secondary border-border h-8 text-xs"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground mb-1 block">Notes</Label>
                            <Input
                              value={editForm.notes}
                              onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                              className="bg-secondary border-border h-8 text-xs"
                              placeholder="How are you feeling?"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => saveEdit(entry.id)}
                            >
                              <Check className="w-3.5 h-3.5 mr-1.5" /> Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setEditingId(null)}
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

export default Progress;
