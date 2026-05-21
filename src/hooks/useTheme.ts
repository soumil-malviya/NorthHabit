import { useEffect } from 'react';
import { useLocalStorageString } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import type { ThemeMode } from '../types';

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
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, setTheme, toggleTheme };
}
