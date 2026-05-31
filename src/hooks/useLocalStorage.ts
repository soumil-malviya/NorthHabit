import { useState, useEffect, useCallback } from 'react';

export const LOCAL_STORAGE_SYNC_EVENT = 'northhabit:storage-sync';

export function publishStorageSync<T>(key: string, value: T) {
  window.dispatchEvent(
    new CustomEvent(LOCAL_STORAGE_SYNC_EVENT, { detail: { key, value } }),
  );
}

function readStorage<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item !== null) return JSON.parse(item) as T;
  } catch {
    /* ignore */
  }
  return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => readStorage(key, initialValue));

  useEffect(() => {
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T }>).detail;
      if (detail?.key === key) {
        setStored(detail.value);
      }
    };
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, onSync);
    return () => window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, onSync);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
          publishStorageSync(key, next);
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  return [stored, setValue] as const;
}

export function useLocalStorageString(key: string, initialValue: string) {
  const [stored, setStored] = useState<string>(() => {
    return localStorage.getItem(key) ?? initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, stored);
    publishStorageSync(key, stored);
  }, [key, stored]);

  useEffect(() => {
    const onSync = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: string }>).detail;
      if (detail?.key === key && typeof detail.value === 'string') {
        setStored(detail.value);
      }
    };
    window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, onSync);
    return () => window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, onSync);
  }, [key]);

  return [stored, setStored] as const;
}
