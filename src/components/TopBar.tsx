import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useGymStore } from '@/store/useGymStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthModal } from './AuthModal';
import { SyncBanner } from './SyncBanner';
import { Cloud, CloudOff, Loader2, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TopBar = () => {
  const { user, initialized } = useAuthStore();
  const { isLoadingCloudData } = useGymStore();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Velvet Lift
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isLoadingCloudData && (
              <span className="flex items-center text-[11px] text-muted-foreground gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                Syncing...
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthOpen(true)}
              className="h-8 px-2.5 text-xs flex items-center gap-1.5 border-border bg-card hover:bg-secondary"
            >
              {user ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{isSupabaseConfigured ? 'Sign In' : 'Cloud Setup'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <SyncBanner />

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};
