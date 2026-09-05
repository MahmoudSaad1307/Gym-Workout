import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, LogIn, UserPlus, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const { user, signIn, signUp, signOut, loading } = useAuthStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      toast.success('Signed in successfully!');
      resetForm();
      onOpenChange(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const res = await signUp(email.trim(), password);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.needsEmailConfirmation) {
      toast.info('Verification link sent!', {
        description: 'Please check your email to confirm your account.',
      });
      resetForm();
      onOpenChange(false);
    } else {
      toast.success('Account created and signed in!');
      resetForm();
      onOpenChange(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out.');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {user ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Account Details
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 text-primary" />
                Cloud Sync & Account
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {user
              ? 'You are signed in. Your workouts and progress sync to Supabase.'
              : 'Sign in to automatically sync your workouts, progress, and custom exercises across all your devices.'}
          </DialogDescription>
        </DialogHeader>

        {!isSupabaseConfigured && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Supabase Credentials Missing</p>
              <p className="text-muted-foreground mt-0.5">
                Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
              </p>
            </div>
          </div>
        )}

        {user ? (
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-xs text-muted-foreground block">Signed in as</span>
              <span className="text-sm font-semibold text-foreground break-all">{user.email}</span>
            </div>
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleSignOut}
              disabled={loading}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => { setTab(v as 'signin' | 'signup'); setError(null); }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label className="text-xs">Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 mt-2"
                  disabled={isSubmitting || !isSupabaseConfigured}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label className="text-xs">Password</Label>
                  <Input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 mt-2"
                  disabled={isSubmitting || !isSupabaseConfigured}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
