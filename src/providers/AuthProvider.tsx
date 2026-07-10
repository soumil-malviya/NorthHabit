import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { AuthContext, type AuthContextValue } from '../context/AuthContext';
import { auth, googleProvider } from '../lib/firebase';

function getReadableAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.';
  }

  if (import.meta.env.DEV) {
    console.warn('Firebase auth error:', error.code, error.message);
  }

  if (error.code.includes('api-key-not-valid') || error.code.includes('invalid-api-key')) {
    return 'Firebase rejected this API key. Check VITE_FIREBASE_API_KEY in .env.local and restart the dev server.';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.';
    case 'auth/missing-password':
      return 'Enter your password.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project.';
    case 'auth/popup-blocked':
      return 'The browser blocked the Google sign-in popup. Allow popups for this site and try again.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before signing in.';
    case 'auth/cancelled-popup-request':
      return 'Another Google sign-in popup was already open. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication. Add localhost to Authorized domains.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Authentication failed. Please try again.';
  }
}

async function runAuthAction(action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
  } catch (error) {
    throw new Error(getReadableAuthError(error));
  }
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-9 w-9 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Loading workspace
        </p>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void setPersistence(auth, browserLocalPersistence)
      .catch(() => {
        /* Firebase falls back to its default persistence if this is unavailable. */
      })
      .finally(() => {
        if (cancelled) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setLoading(false);
        });
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signInWithGoogle = useCallback(
    () => runAuthAction(() => signInWithPopup(auth, googleProvider)),
    [],
  );

  const signOut = useCallback(
    () => runAuthAction(() => firebaseSignOut(auth)),
    [],
  );

  const signInWithEmail = useCallback(
    (email: string, password: string) =>
      runAuthAction(() => signInWithEmailAndPassword(auth, email, password)),
    [],
  );

  const signUpWithEmail = useCallback(
    (email: string, password: string) =>
      runAuthAction(() => createUserWithEmailAndPassword(auth, email, password)),
    [],
  );

  const resetPassword = useCallback(
    (email: string) => runAuthAction(() => sendPasswordResetEmail(auth, email)),
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signOut,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
    }),
    [
      user,
      loading,
      signInWithGoogle,
      signOut,
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
    ],
  );

  if (loading) return <AuthLoadingScreen />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
