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
  targetMinutes: number;
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
export type TreeHealth = 'thriving' | 'stable' | 'wilting' | 'dormant';
export type FocusSessionOutcome = 'completed' | 'abandoned' | 'paused';

export interface ForestTree {
  id: string;
  species: TreeSpecies;
  plantedAt: string;
  durationMinutes: number;
  growthScale: number;
  health: TreeHealth;
  sessionId: string;
}

export interface FocusSessionRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  plannedMinutes: number;
  actualMinutes: number;
  outcome: FocusSessionOutcome;
  growthPercent: number;
  species: TreeSpecies;
}

export interface ActiveSapling {
  sessionId: string;
  species: TreeSpecies;
  growth: number;
  health: TreeHealth;
  startedAt: string;
  plannedMinutes: number;
  elapsedSeconds: number;
}

export interface FocusEcosystemState {
  trees: ForestTree[];
  sessions: FocusSessionRecord[];
  dailyMinutes: Record<string, number>;
  weeklyMinutes: Record<string, number>;
  ecosystemVitality: number;
  activeSapling: ActiveSapling | null;
}

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

export interface HabitReminderSettings {
  enabled: boolean;
  time: string;
  onlyIfPending: boolean;
}

export interface PomodoroNotificationSettings {
  enabled: boolean;
  onWorkComplete: boolean;
  onBreakComplete: boolean;
}

export interface StreakReminderSettings {
  enabled: boolean;
  time: string;
  minStreakDays: number;
}

export interface QuietHoursSettings {
  enabled: boolean;
  start: string;
  end: string;
}

export interface NotificationLastFired {
  habitDaily?: string;
  streakDaily?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  permissionAsked: boolean;
  habitReminders: HabitReminderSettings;
  pomodoro: PomodoroNotificationSettings;
  streak: StreakReminderSettings;
  quietHours: QuietHoursSettings;
  lastFired: NotificationLastFired;
}

export interface NotificationPayload {
  title: string;
  body: string;
  tag: string;
  url?: string;
}
