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
