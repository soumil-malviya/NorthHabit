import { useEffect, useState } from 'react';
import {
  subscribeFirestoreSyncState,
  type FirestoreSyncState,
} from '../services/firestoreWorkspaceService';
import { useAuth } from './useAuth';

function estimateLocalStorageBytes(): number {
  if (typeof localStorage === 'undefined') return 0;

  let total = 0;
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    const value = localStorage.getItem(key) ?? '';
    total += key.length + value.length;
  }
  return total * 2;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function useSyncStatus() {
  const { user } = useAuth();
  const [syncState, setSyncState] = useState<FirestoreSyncState>(() => ({
    status: 'idle',
    lastSyncAt: null,
    errorMessage: null,
    isActive: false,
  }));
  const [storageBytes, setStorageBytes] = useState(0);

  useEffect(() => {
    return subscribeFirestoreSyncState(setSyncState);
  }, []);

  useEffect(() => {
    const updateStorage = () => setStorageBytes(estimateLocalStorageBytes());
    updateStorage();

    const onStorage = () => updateStorage();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const connectionLabel =
    !user
      ? 'Sign in required'
      : syncState.status === 'connected'
        ? 'Connected'
        : syncState.status === 'connecting'
          ? 'Connecting'
          : syncState.status === 'error'
            ? 'Connection error'
            : 'Idle';

  const syncLabel =
    !user
      ? 'Not signed in'
      : syncState.lastSyncAt
        ? syncState.lastSyncAt.toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : syncState.status === 'connecting'
          ? 'Establishing sync…'
          : 'No sync yet';

  return {
    syncState,
    storageLabel: formatBytes(storageBytes),
    connectionLabel,
    syncLabel,
    isSignedIn: Boolean(user),
  };
}
