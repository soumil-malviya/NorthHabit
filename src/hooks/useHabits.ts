import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import type { Habit } from '../types';

export function useHabits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>(STORAGE_KEYS.habits, []);
  return { habits, setHabits };
}
