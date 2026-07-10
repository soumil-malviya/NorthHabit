import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowRight, KeyRound, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

type AuthMode = 'login' | 'signup';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}

export function LoginModal() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === 'login';

  const runAction = async (action: () => Promise<void>) => {
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Enter your email address.');
      return;
    }

    if (!password) {
      setError('Enter your password.');
      return;
    }

    void runAction(() =>
      isLogin
        ? signInWithEmail(trimmedEmail, password)
        : signUpWithEmail(trimmedEmail, password),
    );
  };

  const handleResetPassword = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Enter your email address first.');
      return;
    }

    void runAction(async () => {
      await resetPassword(trimmedEmail);
      setMessage('Password reset email sent. Check your inbox.');
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4 py-10">
      <div
        className="fixed inset-0 bg-slate-950/35 backdrop-blur-sm"
        aria-hidden="true"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border-light)] bg-[var(--surface-raised)]/95 p-6 shadow-2xl shadow-black/15"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
            <KeyRound className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
            NorthHabit
          </p>
          <h1 id="login-modal-title" className="mt-2 text-2xl font-extrabold tracking-tight">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Sign in to keep your workspace ready for cloud sync.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void runAction(signInWithGoogle)}
          disabled={submitting}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-light)] bg-white/70 px-4 py-3 text-sm font-bold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 disabled:pointer-events-none disabled:opacity-60 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-slate-900">
            G
          </span>
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          <span className="h-px flex-1 bg-[var(--border-light)]" />
          or
          <span className="h-px flex-1 bg-[var(--border-light)]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
              Email
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] px-3 py-2.5 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
              <Mail className="h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
              Password
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-secondary)] px-3 py-2.5 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
              <Lock className="h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </span>
          </label>

          {error && (
            <p className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? 'signup' : 'login');
              setError('');
              setMessage('');
            }}
            className="font-bold text-cyan-700 transition-colors hover:text-cyan-500 dark:text-cyan-300"
          >
            {isLogin ? 'Create Account' : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={submitting}
            className="text-xs font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-60"
          >
            Forgot Password?
          </button>
        </div>
      </section>
    </div>
  );
}
