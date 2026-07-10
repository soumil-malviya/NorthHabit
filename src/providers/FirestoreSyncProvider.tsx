import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  startFirestoreWorkspaceSync,
  stopFirestoreWorkspaceSync,
} from '../services/firestoreWorkspaceService';

export function FirestoreSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      stopFirestoreWorkspaceSync();
      return undefined;
    }

    let cancelled = false;

    void startFirestoreWorkspaceSync(user.uid, (error) => {
      if (import.meta.env.DEV) {
        console.warn('Firestore sync error:', error.code, error.message);
      }
    }).catch((error: unknown) => {
      if (!cancelled && import.meta.env.DEV) {
        console.warn('Failed to start Firestore sync:', error);
      }
    });

    return () => {
      cancelled = true;
      stopFirestoreWorkspaceSync();
    };
  }, [user]);

  return <>{children}</>;
}
