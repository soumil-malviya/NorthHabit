export type CategoryType = 'health' | 'fitness' | 'mindfulness' | 'work' | 'creative';
export type DifficultyType = 'easy' | 'medium' | 'hard';
export type FrequencyType = 'daily' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  frequency: FrequencyType;
  difficulty: DifficultyType;
  logs: string[]; // List of YYYY-MM-DD date strings when completed
  createdAt: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  scheduledDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export type ThemeMode = 'light' | 'dark';

export type TreeSpecies = 'pine' | 'oak' | 'birch' | 'maple';

export interface ForestTree {
  id: string;
  species: TreeSpecies;
  plantedAt: string;
  durationMinutes: number;
}
