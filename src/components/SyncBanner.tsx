import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useGymStore } from '@/store/useGymStore';
import { migrationService } from '@/services/migrationService';
import { Button } from '@/components/ui/button';
import { CloudUpload, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export const SyncBanner = () => {
  const { user } = useAuthStore();
  const { syncLocalDataToCloud } = useGymStore();
  const [hasLocalDataToMigrate, setHasLocalDataToMigrate] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasLocalDataToMigrate(false);
      return;
    }

    if (migrationService.hasMigrated(user.id)) {
      setHasLocalDataToMigrate(false);
      return;
    }

    const localData = migrationService.getLocalData();
    if (localData && (localData.workoutLogs.length > 0 || localData.progressEntries.length > 0)) {
      setHasLocalDataToMigrate(true);
    }
  }, [user]);

  if (!user || !hasLocalDataToMigrate || dismissed) {
    return null;
  }

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncLocalDataToCloud(user.id);
      toast.success('Sync complete!', {
        description: `Successfully uploaded ${res.workoutsCount} workouts and ${res.progressCount} progress entries to Supabase.`,
      });
      setHasLocalDataToMigrate(false);
    } catch (err) {
      toast.error('Sync failed. Please try again.');
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 mx-4 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <CloudUpload className="w-5 h-5 text-primary shrink-0" />
        <div className="truncate">
          <p className="font-semibold text-foreground text-xs sm:text-sm">Found previous local workouts</p>
          <p className="text-xs text-muted-foreground truncate">
            Upload your existing local logs to your Supabase account.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          className="h-8 text-xs bg-primary hover:bg-primary/90"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          )}
          Sync Now
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
