import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { STORAGE_KEYS } from '../constants/storage';
import { BRAND } from '../constants/brand';
import { DEFAULT_AMBIENT_SETTINGS } from '../constants/ambientDefaults';
import { DEFAULT_ECOSYSTEM } from '../constants/focusEcosystemDefaults';
import { DEFAULT_NOTIFICATION_PREFS } from '../constants/notificationDefaults';
import { DEFAULT_SOUNDSCAPE_SETTINGS } from '../constants/soundscapeDefaults';
import type {
  FocusEcosystemState,
  ForestTree,
  FocusSessionRecord,
  Habit,
  NotificationPreferences,
  PomodoroSettings,
  ThemeMode,
  Todo,
} from '../types';
import type { AmbientSettings } from '../types/ambient';
import type { SoundscapeSettings } from '../lib/soundscape/types';
import {
  applyCloudStorageValue,
  runWithoutCloudStorageWrites,
  setCloudStorageWriter,
} from './cloudStorageBridge';

const SYNC_VERSION = 1;

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

type WorkspaceDocId =
  | 'meta'
  | 'habits'
  | 'todos'
  | 'calendar'
  | 'settings'
  | 'pomodoro'
  | 'themes'
  | 'statistics';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  source?: 'manual' | 'habit' | 'todo' | 'pomodoro';
}

interface WorkspaceSettings {
  username: string;
  onboardingComplete: string;
  onboardingStep: string;
  notifications: NotificationPreferences;
  ambient: AmbientSettings;
  soundscape: SoundscapeSettings;
}

interface StatisticsPayload {
  focusEcosystem: FocusEcosystemState;
  dailyMinutes: FocusEcosystemState['dailyMinutes'];
  weeklyMinutes: FocusEcosystemState['weeklyMinutes'];
}

interface WorkspacePayload {
  habits: Habit[];
  todos: Todo[];
  calendarEvents: CalendarEvent[];
  settings: WorkspaceSettings;
  pomodoro: PomodoroSettings;
  theme: ThemeMode;
  statistics: StatisticsPayload;
}

interface SyncSession {
  uid: string;
  unsubscribes: Unsubscribe[];
}

let activeSession: SyncSession | null = null;
let remoteApplying = false;
let writeQueue: Promise<void> = Promise.resolve();

export type FirestoreConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface FirestoreSyncState {
  status: FirestoreConnectionStatus;
  lastSyncAt: Date | null;
  errorMessage: string | null;
  isActive: boolean;
}

const defaultSyncState: FirestoreSyncState = {
  status: 'idle',
  lastSyncAt: null,
  errorMessage: null,
  isActive: false,
};

let syncState: FirestoreSyncState = { ...defaultSyncState };
const syncStateListeners = new Set<(state: FirestoreSyncState) => void>();

function emitSyncState() {
  syncStateListeners.forEach((listener) => listener(syncState));
}

function updateSyncState(patch: Partial<FirestoreSyncState>) {
  syncState = { ...syncState, ...patch };
  emitSyncState();
}

export function getFirestoreSyncState(): FirestoreSyncState {
  return syncState;
}

export function subscribeFirestoreSyncState(
  listener: (state: FirestoreSyncState) => void,
): () => void {
  syncStateListeners.add(listener);
  listener(syncState);
  return () => {
    syncStateListeners.delete(listener);
  };
}

function workspaceDoc(uid: string, id: WorkspaceDocId) {
  return doc(db, 'users', uid, 'workspace', id);
}

function workspaceCollection(uid: string) {
  return collection(db, 'users', uid, 'workspace');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

function arrayFromDoc<T>(data: DocumentData | undefined, key = 'items'): T[] {
  const value = data?.[key];
  return Array.isArray(value) ? (value as T[]) : [];
}

function objectFromDoc<T>(data: DocumentData | undefined, key: string, fallback: T): T {
  const value = data?.[key];
  return isRecord(value) || Array.isArray(value) ? (value as T) : fallback;
}

function stringFromDoc(data: DocumentData | undefined, key: string, fallback: string): string {
  const value = data?.[key];
  return typeof value === 'string' ? value : fallback;
}

function collectById<T extends { id: string }>(local: T[], remote: T[], merge: (a: T, b: T) => T): T[] {
  const map = new Map<string, T>();
  remote.forEach((item) => map.set(item.id, item));
  local.forEach((item) => {
    const existing = map.get(item.id);
    map.set(item.id, existing ? merge(item, existing) : item);
  });
  return Array.from(map.values());
}

function mergeHabits(local: Habit[], remote: Habit[]): Habit[] {
  return collectById(local, remote, (localHabit, remoteHabit) => ({
    ...remoteHabit,
    ...localHabit,
    logs: Array.from(new Set([...(remoteHabit.logs ?? []), ...(localHabit.logs ?? [])])).sort(),
  })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function mergeTodos(local: Todo[], remote: Todo[]): Todo[] {
  return collectById(local, remote, (localTodo, remoteTodo) => {
    const localTime = localTodo.updatedAt || localTodo.createdAt;
    const remoteTime = remoteTodo.updatedAt || remoteTodo.createdAt;
    return localTime >= remoteTime ? localTodo : remoteTodo;
  }).sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

function mergeRecordsById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  return collectById(local, remote, (localItem) => localItem);
}

function mergeNumberRecords(
  local: Record<string, number>,
  remote: Record<string, number>,
): Record<string, number> {
  const next = { ...remote };
  Object.entries(local).forEach(([key, value]) => {
    next[key] = Math.max(value, next[key] ?? 0);
  });
  return next;
}

function mergeFocusEcosystem(
  local: FocusEcosystemState,
  remote: FocusEcosystemState,
): FocusEcosystemState {
  return {
    trees: mergeRecordsById<ForestTree>(local.trees ?? [], remote.trees ?? []),
    sessions: mergeRecordsById<FocusSessionRecord>(local.sessions ?? [], remote.sessions ?? []),
    dailyMinutes: mergeNumberRecords(local.dailyMinutes ?? {}, remote.dailyMinutes ?? {}),
    weeklyMinutes: mergeNumberRecords(local.weeklyMinutes ?? {}, remote.weeklyMinutes ?? {}),
    ecosystemVitality: Math.max(local.ecosystemVitality ?? 0, remote.ecosystemVitality ?? 0),
    activeSapling: local.activeSapling ?? remote.activeSapling ?? null,
  };
}

function readLocalWorkspace(): WorkspacePayload {
  const focusEcosystem = readJson<FocusEcosystemState>(
    STORAGE_KEYS.focusEcosystem,
    DEFAULT_ECOSYSTEM,
  );

  return {
    habits: readJson<Habit[]>(STORAGE_KEYS.habits, []),
    todos: readJson<Todo[]>(STORAGE_KEYS.todos, []),
    calendarEvents: [],
    settings: {
      username: readString(STORAGE_KEYS.username, BRAND.defaultUsername),
      onboardingComplete: readString(STORAGE_KEYS.onboardingComplete, ''),
      onboardingStep: readString(STORAGE_KEYS.onboardingStep, '0'),
      notifications: readJson<NotificationPreferences>(
        STORAGE_KEYS.notifications,
        DEFAULT_NOTIFICATION_PREFS,
      ),
      ambient: readJson<AmbientSettings>(STORAGE_KEYS.ambient, DEFAULT_AMBIENT_SETTINGS),
      soundscape: readJson<SoundscapeSettings>(
        STORAGE_KEYS.soundscape,
        DEFAULT_SOUNDSCAPE_SETTINGS,
      ),
    },
    pomodoro: readJson<PomodoroSettings>(STORAGE_KEYS.pomodoro, DEFAULT_POMODORO_SETTINGS),
    theme: readString(STORAGE_KEYS.theme, 'light') === 'dark' ? 'dark' : 'light',
    statistics: {
      focusEcosystem,
      dailyMinutes: focusEcosystem.dailyMinutes,
      weeklyMinutes: focusEcosystem.weeklyMinutes,
    },
  };
}

async function readRemoteWorkspace(uid: string): Promise<Partial<WorkspacePayload>> {
  const [
    habitsSnap,
    todosSnap,
    calendarSnap,
    settingsSnap,
    pomodoroSnap,
    themesSnap,
    statisticsSnap,
  ] = await Promise.all([
    getDoc(workspaceDoc(uid, 'habits')),
    getDoc(workspaceDoc(uid, 'todos')),
    getDoc(workspaceDoc(uid, 'calendar')),
    getDoc(workspaceDoc(uid, 'settings')),
    getDoc(workspaceDoc(uid, 'pomodoro')),
    getDoc(workspaceDoc(uid, 'themes')),
    getDoc(workspaceDoc(uid, 'statistics')),
  ]);

  const settingsData = settingsSnap.data();
  const statisticsData = statisticsSnap.data();
  const focusEcosystem = objectFromDoc<FocusEcosystemState>(
    statisticsData,
    'focusEcosystem',
    DEFAULT_ECOSYSTEM,
  );

  return {
    habits: arrayFromDoc<Habit>(habitsSnap.data()),
    todos: arrayFromDoc<Todo>(todosSnap.data()),
    calendarEvents: arrayFromDoc<CalendarEvent>(calendarSnap.data(), 'events'),
    settings: settingsSnap.exists()
      ? {
          username: stringFromDoc(settingsData, 'username', BRAND.defaultUsername),
          onboardingComplete: stringFromDoc(settingsData, 'onboardingComplete', ''),
          onboardingStep: stringFromDoc(settingsData, 'onboardingStep', '0'),
          notifications: objectFromDoc<NotificationPreferences>(
            settingsData,
            'notifications',
            DEFAULT_NOTIFICATION_PREFS,
          ),
          ambient: objectFromDoc<AmbientSettings>(
            settingsData,
            'ambient',
            DEFAULT_AMBIENT_SETTINGS,
          ),
          soundscape: objectFromDoc<SoundscapeSettings>(
            settingsData,
            'soundscape',
            DEFAULT_SOUNDSCAPE_SETTINGS,
          ),
        }
      : undefined,
    pomodoro: objectFromDoc<PomodoroSettings>(
      pomodoroSnap.data(),
      'preferences',
      DEFAULT_POMODORO_SETTINGS,
    ),
    theme: stringFromDoc(themesSnap.data(), 'mode', 'light') === 'dark' ? 'dark' : 'light',
    statistics: statisticsSnap.exists()
      ? {
          focusEcosystem,
          dailyMinutes: objectFromDoc<FocusEcosystemState['dailyMinutes']>(
            statisticsData,
            'dailyMinutes',
            focusEcosystem.dailyMinutes,
          ),
          weeklyMinutes: objectFromDoc<FocusEcosystemState['weeklyMinutes']>(
            statisticsData,
            'weeklyMinutes',
            focusEcosystem.weeklyMinutes,
          ),
        }
      : undefined,
  };
}

function mergeWorkspace(local: WorkspacePayload, remote: Partial<WorkspacePayload>): WorkspacePayload {
  const remoteStats = remote.statistics;
  const focusEcosystem = mergeFocusEcosystem(
    local.statistics.focusEcosystem,
    remoteStats?.focusEcosystem ?? DEFAULT_ECOSYSTEM,
  );

  return {
    habits: mergeHabits(local.habits, remote.habits ?? []),
    todos: mergeTodos(local.todos, remote.todos ?? []),
    calendarEvents: mergeRecordsById(local.calendarEvents, remote.calendarEvents ?? []),
    settings: {
      ...(remote.settings ?? local.settings),
      ...local.settings,
    },
    pomodoro: {
      ...(remote.pomodoro ?? DEFAULT_POMODORO_SETTINGS),
      ...local.pomodoro,
    },
    theme: local.theme ?? remote.theme ?? 'light',
    statistics: {
      focusEcosystem,
      dailyMinutes: mergeNumberRecords(
        local.statistics.dailyMinutes,
        remoteStats?.dailyMinutes ?? {},
      ),
      weeklyMinutes: mergeNumberRecords(
        local.statistics.weeklyMinutes,
        remoteStats?.weeklyMinutes ?? {},
      ),
    },
  };
}

function writeWorkspaceBatch(uid: string, workspace: WorkspacePayload) {
  const batch = writeBatch(db);
  const now = serverTimestamp();

  batch.set(
    workspaceDoc(uid, 'meta'),
    {
      syncVersion: SYNC_VERSION,
      migratedAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
  batch.set(workspaceDoc(uid, 'habits'), { items: workspace.habits, updatedAt: now }, { merge: true });
  batch.set(workspaceDoc(uid, 'todos'), { items: workspace.todos, updatedAt: now }, { merge: true });
  batch.set(
    workspaceDoc(uid, 'calendar'),
    { events: workspace.calendarEvents, updatedAt: now },
    { merge: true },
  );
  batch.set(workspaceDoc(uid, 'settings'), { ...workspace.settings, updatedAt: now }, { merge: true });
  batch.set(
    workspaceDoc(uid, 'pomodoro'),
    { preferences: workspace.pomodoro, updatedAt: now },
    { merge: true },
  );
  batch.set(workspaceDoc(uid, 'themes'), { mode: workspace.theme, updatedAt: now }, { merge: true });
  batch.set(
    workspaceDoc(uid, 'statistics'),
    {
      ...workspace.statistics,
      updatedAt: now,
    },
    { merge: true },
  );

  return batch.commit();
}

function applyWorkspaceToLocalCache(workspace: WorkspacePayload) {
  remoteApplying = true;
  try {
    applyCloudStorageValue(STORAGE_KEYS.habits, workspace.habits);
    applyCloudStorageValue(STORAGE_KEYS.todos, workspace.todos);
    applyCloudStorageValue(STORAGE_KEYS.username, workspace.settings.username, 'string');
    applyCloudStorageValue(
      STORAGE_KEYS.onboardingComplete,
      workspace.settings.onboardingComplete,
      'string',
    );
    applyCloudStorageValue(STORAGE_KEYS.onboardingStep, workspace.settings.onboardingStep, 'string');
    applyCloudStorageValue(STORAGE_KEYS.notifications, workspace.settings.notifications);
    applyCloudStorageValue(STORAGE_KEYS.ambient, workspace.settings.ambient);
    applyCloudStorageValue(STORAGE_KEYS.soundscape, workspace.settings.soundscape);
    applyCloudStorageValue(STORAGE_KEYS.pomodoro, workspace.pomodoro);
    applyCloudStorageValue(STORAGE_KEYS.theme, workspace.theme, 'string');
    applyCloudStorageValue(STORAGE_KEYS.focusEcosystem, workspace.statistics.focusEcosystem);
  } finally {
    remoteApplying = false;
  }
}

function writeStorageKeyToCloud(uid: string, key: string, value: unknown) {
  if (remoteApplying) return;

  writeQueue = writeQueue
    .catch(() => undefined)
    .then(async () => {
      const batch = writeBatch(db);
      const now = serverTimestamp();

      switch (key) {
        case STORAGE_KEYS.habits:
          batch.set(workspaceDoc(uid, 'habits'), { items: value, updatedAt: now }, { merge: true });
          break;
        case STORAGE_KEYS.todos:
          batch.set(workspaceDoc(uid, 'todos'), { items: value, updatedAt: now }, { merge: true });
          break;
        case STORAGE_KEYS.username:
          batch.set(workspaceDoc(uid, 'settings'), { username: value, updatedAt: now }, { merge: true });
          break;
        case STORAGE_KEYS.onboardingComplete:
          batch.set(
            workspaceDoc(uid, 'settings'),
            { onboardingComplete: value, updatedAt: now },
            { merge: true },
          );
          break;
        case STORAGE_KEYS.onboardingStep:
          batch.set(
            workspaceDoc(uid, 'settings'),
            { onboardingStep: value, updatedAt: now },
            { merge: true },
          );
          break;
        case STORAGE_KEYS.notifications:
          batch.set(
            workspaceDoc(uid, 'settings'),
            { notifications: value, updatedAt: now },
            { merge: true },
          );
          break;
        case STORAGE_KEYS.ambient:
          batch.set(workspaceDoc(uid, 'settings'), { ambient: value, updatedAt: now }, { merge: true });
          break;
        case STORAGE_KEYS.soundscape:
          batch.set(
            workspaceDoc(uid, 'settings'),
            { soundscape: value, updatedAt: now },
            { merge: true },
          );
          break;
        case STORAGE_KEYS.pomodoro:
          batch.set(
            workspaceDoc(uid, 'pomodoro'),
            { preferences: value, updatedAt: now },
            { merge: true },
          );
          break;
        case STORAGE_KEYS.theme:
          batch.set(workspaceDoc(uid, 'themes'), { mode: value, updatedAt: now }, { merge: true });
          break;
        case STORAGE_KEYS.focusEcosystem:
          batch.set(
            workspaceDoc(uid, 'statistics'),
            {
              focusEcosystem: value,
              dailyMinutes: isRecord(value) ? value.dailyMinutes : {},
              weeklyMinutes: isRecord(value) ? value.weeklyMinutes : {},
              updatedAt: now,
            },
            { merge: true },
          );
          break;
        default:
          return;
      }

      batch.set(workspaceDoc(uid, 'meta'), { syncVersion: SYNC_VERSION, updatedAt: now }, { merge: true });
      await batch.commit();
    });
}

function handleSnapshotDoc(id: string, data: DocumentData | undefined) {
  switch (id) {
    case 'habits':
      applyCloudStorageValue(STORAGE_KEYS.habits, arrayFromDoc<Habit>(data));
      break;
    case 'todos':
      applyCloudStorageValue(STORAGE_KEYS.todos, arrayFromDoc<Todo>(data));
      break;
    case 'settings':
      applyCloudStorageValue(
        STORAGE_KEYS.username,
        stringFromDoc(data, 'username', BRAND.defaultUsername),
        'string',
      );
      applyCloudStorageValue(
        STORAGE_KEYS.onboardingComplete,
        stringFromDoc(data, 'onboardingComplete', ''),
        'string',
      );
      applyCloudStorageValue(
        STORAGE_KEYS.onboardingStep,
        stringFromDoc(data, 'onboardingStep', '0'),
        'string',
      );
      applyCloudStorageValue(
        STORAGE_KEYS.notifications,
        objectFromDoc<NotificationPreferences>(data, 'notifications', DEFAULT_NOTIFICATION_PREFS),
      );
      applyCloudStorageValue(
        STORAGE_KEYS.ambient,
        objectFromDoc<AmbientSettings>(data, 'ambient', DEFAULT_AMBIENT_SETTINGS),
      );
      applyCloudStorageValue(
        STORAGE_KEYS.soundscape,
        objectFromDoc<SoundscapeSettings>(data, 'soundscape', DEFAULT_SOUNDSCAPE_SETTINGS),
      );
      break;
    case 'pomodoro':
      applyCloudStorageValue(
        STORAGE_KEYS.pomodoro,
        objectFromDoc<PomodoroSettings>(data, 'preferences', DEFAULT_POMODORO_SETTINGS),
      );
      break;
    case 'themes':
      applyCloudStorageValue(
        STORAGE_KEYS.theme,
        stringFromDoc(data, 'mode', 'light') === 'dark' ? 'dark' : 'light',
        'string',
      );
      break;
    case 'statistics':
      applyCloudStorageValue(
        STORAGE_KEYS.focusEcosystem,
        objectFromDoc<FocusEcosystemState>(data, 'focusEcosystem', DEFAULT_ECOSYSTEM),
      );
      break;
    default:
      break;
  }
}

async function migrateLocalDataIfNeeded(uid: string) {
  const metaSnap = await getDoc(workspaceDoc(uid, 'meta'));
  if (metaSnap.exists() && typeof metaSnap.data().migratedAt !== 'undefined') {
    return;
  }

  const localWorkspace = readLocalWorkspace();
  const remoteWorkspace = await readRemoteWorkspace(uid);
  const merged = mergeWorkspace(localWorkspace, remoteWorkspace);

  await writeWorkspaceBatch(uid, merged);
  applyWorkspaceToLocalCache(merged);
}

function subscribeToWorkspace(uid: string, onError?: (error: FirestoreError) => void): Unsubscribe {
  return onSnapshot(
    workspaceCollection(uid),
    (snapshot) => {
      updateSyncState({
        status: 'connected',
        lastSyncAt: new Date(),
        errorMessage: null,
        isActive: true,
      });

      remoteApplying = true;
      try {
        runWithoutCloudStorageWrites(() => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'removed') return;
            handleSnapshotDoc(change.doc.id, change.doc.data());
          });
        });
      } finally {
        remoteApplying = false;
      }
    },
    (error) => {
      updateSyncState({
        status: 'error',
        errorMessage: error.message,
        isActive: Boolean(activeSession),
      });
      onError?.(error);
    },
  );
}

export async function startFirestoreWorkspaceSync(
  uid: string,
  onError?: (error: FirestoreError) => void,
) {
  stopFirestoreWorkspaceSync();

  updateSyncState({
    status: 'connecting',
    lastSyncAt: null,
    errorMessage: null,
    isActive: true,
  });

  setCloudStorageWriter((key, value) => writeStorageKeyToCloud(uid, key, value));

  await migrateLocalDataIfNeeded(uid);

  activeSession = {
    uid,
    unsubscribes: [subscribeToWorkspace(uid, onError)],
  };
}

export function stopFirestoreWorkspaceSync() {
  activeSession?.unsubscribes.forEach((unsubscribe) => unsubscribe());
  activeSession = null;
  setCloudStorageWriter(null);
  updateSyncState({ ...defaultSyncState });
}
