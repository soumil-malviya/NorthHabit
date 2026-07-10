import { useCallback, useEffect } from 'react';
import { useLocalStorageString } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import type { ThemeMode } from '../types';

const TRANSITION_MS = 900;

export function useTheme() {
  const [theme, setTheme] = useLocalStorageString(STORAGE_KEYS.theme, 'light') as [
    ThemeMode,
    (v: ThemeMode | ((p: ThemeMode) => ThemeMode)) => void,
  ];

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark');
    }
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add('theme-transitioning');
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, TRANSITION_MS);
  }, [setTheme]);

  const setThemeWithTransition = useCallback(
    (next: ThemeMode) => {
      if (next === theme) return;
      document.documentElement.classList.add('theme-transitioning');
      setTheme(next);
      window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, TRANSITION_MS);
    },
    [setTheme, theme],
  );

  return { theme, setTheme: setThemeWithTransition, toggleTheme };
}
