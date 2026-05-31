import { STORAGE_KEYS } from '../../constants/storage';
import { DEFAULT_AMBIENT_SETTINGS } from '../../constants/ambientDefaults';
import { DEFAULT_ECOSYSTEM } from '../../constants/focusEcosystemDefaults';
import { DEFAULT_NOTIFICATION_PREFS } from '../../constants/notificationDefaults';
import { DEFAULT_SOUNDSCAPE_SETTINGS } from '../../constants/soundscapeDefaults';
import type { FocusEcosystemState, Habit, PomodoroSettings, ThemeMode, Todo } from '../../types';
import type { AmbientSettings } from '../../types/ambient';
import type { SoundscapeSettings } from '../soundscape/types';
import { getLocalDateString } from '../../utils';
import { publishStorageSync } from '../../hooks/useLocalStorage';

const EXPORT_VERSION = 1;

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

export interface NorthHabitExport {
  app: 'NorthHabit';
  version: number;
  exportedAt: string;
  data: {
    habits: Habit[];
    todos: Todo[];
    focusSessions: FocusEcosystemState['sessions'];
    settings: {
      username: string;
      theme: ThemeMode;
      pomodoro: PomodoroSettings;
      notifications: unknown;
      soundscape: SoundscapeSettings;
      ambient: AmbientSettings;
      onboardingComplete: string;
    };
    themes: {
      current: ThemeMode;
      ambient: AmbientSettings;
    };
    analytics: {
      focusEcosystem: FocusEcosystemState;
      dailyMinutes: FocusEcosystemState['dailyMinutes'];
      weeklyMinutes: FocusEcosystemState['weeklyMinutes'];
    };
    streaks: {
      habitLogs: Array<Pick<Habit, 'id' | 'name' | 'logs'>>;
    };
    appPreferences: Record<string, unknown>;
  };
}

export type ImportValidation =
  | { ok: true; backup: NorthHabitExport; warnings: string[] }
  | { ok: false; error: string };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readString(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasHabitShape(value: unknown): value is Habit {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

function normalizeBackup(raw: unknown): ImportValidation {
  const warnings: string[] = [];

  if (Array.isArray(raw)) {
    if (!raw.every(hasHabitShape)) {
      return { ok: false, error: 'This older backup does not look like a habit export.' };
    }
    warnings.push('Older habit-only backup detected. Only routines will be imported.');
    return {
      ok: true,
      warnings,
      backup: {
        app: 'NorthHabit',
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        data: {
          habits: raw as Habit[],
          todos: [],
          focusSessions: [],
          settings: {
            username: 'Explorer',
            theme: 'light',
            pomodoro: DEFAULT_POMODORO_SETTINGS,
            notifications: DEFAULT_NOTIFICATION_PREFS,
            soundscape: DEFAULT_SOUNDSCAPE_SETTINGS,
            ambient: DEFAULT_AMBIENT_SETTINGS,
            onboardingComplete: '',
          },
          themes: { current: 'light', ambient: DEFAULT_AMBIENT_SETTINGS },
          analytics: {
            focusEcosystem: DEFAULT_ECOSYSTEM,
            dailyMinutes: {},
            weeklyMinutes: {},
          },
          streaks: { habitLogs: raw.map((habit) => ({ id: habit.id, name: habit.name, logs: habit.logs ?? [] })) },
          appPreferences: {},
        },
      },
    };
  }

  if (!isRecord(raw) || raw.app !== 'NorthHabit' || !isRecord(raw.data)) {
    return { ok: false, error: 'This file is not a NorthHabit export.' };
  }

  const data = raw.data;
  if (!Array.isArray(data.habits) || !data.habits.every(hasHabitShape)) {
    return { ok: false, error: 'The habits section is missing or invalid.' };
  }

  if (!Array.isArray(data.todos)) warnings.push('Todos were missing and will be reset.');
  if (!isRecord(data.settings)) warnings.push('Settings were incomplete and will use safe defaults.');
  if (!isRecord(data.analytics)) warnings.push('Analytics were incomplete and will use safe defaults.');

  return {
    ok: true,
    warnings,
    backup: raw as unknown as NorthHabitExport,
  };
}

export function createNorthHabitExport(): NorthHabitExport {
  const theme = readString(STORAGE_KEYS.theme, 'light') === 'dark' ? 'dark' : 'light';
  const focusEcosystem = readJson<FocusEcosystemState>(STORAGE_KEYS.focusEcosystem, DEFAULT_ECOSYSTEM);
  const ambient = readJson<AmbientSettings>(STORAGE_KEYS.ambient, DEFAULT_AMBIENT_SETTINGS);
  const habits = readJson<Habit[]>(STORAGE_KEYS.habits, []);

  return {
    app: 'NorthHabit',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      habits,
      todos: readJson<Todo[]>(STORAGE_KEYS.todos, []),
      focusSessions: focusEcosystem.sessions,
      settings: {
        username: readString(STORAGE_KEYS.username, 'Explorer'),
        theme,
        pomodoro: readJson<PomodoroSettings>(STORAGE_KEYS.pomodoro, DEFAULT_POMODORO_SETTINGS),
        notifications: readJson(STORAGE_KEYS.notifications, DEFAULT_NOTIFICATION_PREFS),
        soundscape: readJson<SoundscapeSettings>(STORAGE_KEYS.soundscape, DEFAULT_SOUNDSCAPE_SETTINGS),
        ambient,
        onboardingComplete: readString(STORAGE_KEYS.onboardingComplete, ''),
      },
      themes: {
        current: theme,
        ambient,
      },
      analytics: {
        focusEcosystem,
        dailyMinutes: focusEcosystem.dailyMinutes,
        weeklyMinutes: focusEcosystem.weeklyMinutes,
      },
      streaks: {
        habitLogs: habits.map((habit) => ({ id: habit.id, name: habit.name, logs: habit.logs })),
      },
      appPreferences: {
        soundscape: readJson(STORAGE_KEYS.soundscape, DEFAULT_SOUNDSCAPE_SETTINGS),
        notifications: readJson(STORAGE_KEYS.notifications, DEFAULT_NOTIFICATION_PREFS),
      },
    },
  };
}

export function downloadNorthHabitExport() {
  const backup = createNorthHabitExport();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `northhabit-export-${getLocalDateString(0)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function parseNorthHabitImport(file: File): Promise<ImportValidation> {
  try {
    return normalizeBackup(JSON.parse(await file.text()));
  } catch {
    return { ok: false, error: 'The selected file is not valid JSON.' };
  }
}

export function applyNorthHabitImport(backup: NorthHabitExport) {
  const { data } = backup;
  const settings: Partial<NorthHabitExport['data']['settings']> = data.settings ?? {};
  const analytics: Partial<NorthHabitExport['data']['analytics']> = data.analytics ?? {};
  const focusEcosystem = analytics.focusEcosystem ?? DEFAULT_ECOSYSTEM;
  const entries: Array<[string, unknown, 'json' | 'string']> = [
    [STORAGE_KEYS.habits, data.habits ?? [], 'json'],
    [STORAGE_KEYS.todos, data.todos ?? [], 'json'],
    [STORAGE_KEYS.focusEcosystem, focusEcosystem, 'json'],
    [STORAGE_KEYS.pomodoro, settings.pomodoro ?? DEFAULT_POMODORO_SETTINGS, 'json'],
    [STORAGE_KEYS.notifications, settings.notifications ?? DEFAULT_NOTIFICATION_PREFS, 'json'],
    [STORAGE_KEYS.soundscape, settings.soundscape ?? DEFAULT_SOUNDSCAPE_SETTINGS, 'json'],
    [STORAGE_KEYS.ambient, settings.ambient ?? DEFAULT_AMBIENT_SETTINGS, 'json'],
    [STORAGE_KEYS.username, settings.username ?? 'Explorer', 'string'],
    [STORAGE_KEYS.theme, settings.theme === 'dark' ? 'dark' : 'light', 'string'],
    [STORAGE_KEYS.onboardingComplete, settings.onboardingComplete ?? '', 'string'],
  ];

  entries.forEach(([key, value, type]) => {
    localStorage.setItem(key, type === 'json' ? JSON.stringify(value) : String(value));
    publishStorageSync(key, value);
  });
}
