import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Settings, Timer } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { FocusForest } from './FocusForest';
import type { PomodoroSettings, ForestTree, TreeSpecies } from '../types';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

const SPECIES: TreeSpecies[] = ['pine', 'oak', 'birch', 'maple'];

type Phase = 'work' | 'break' | 'longBreak' | 'idle';

function randomSpecies(): TreeSpecies {
  return SPECIES[Math.floor(Math.random() * SPECIES.length)];
}

export function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
    STORAGE_KEYS.pomodoro,
    DEFAULT_SETTINGS,
  );
  const [forest, setForest] = useLocalStorage<ForestTree[]>(STORAGE_KEYS.forest, []);
  const [showSettings, setShowSettings] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(settings.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const phaseRef = useRef(phase);
  const sessionsRef = useRef(sessionsCompleted);

  phaseRef.current = phase;
  sessionsRef.current = sessionsCompleted;

  const getDuration = useCallback(
    (p: Phase) => {
      if (p === 'work') return settings.workMinutes * 60;
      if (p === 'longBreak') return settings.longBreakMinutes * 60;
      if (p === 'break') return settings.breakMinutes * 60;
      return settings.workMinutes * 60;
    },
    [settings],
  );

  const plantTree = useCallback(() => {
    const tree: ForestTree = {
      id: `tree-${Date.now()}`,
      species: randomSpecies(),
      plantedAt: new Date().toISOString(),
      durationMinutes: settings.workMinutes,
    };
    setForest((prev) => [...prev, tree]);
  }, [settings.workMinutes, setForest]);

  const resetToPhase = (p: Phase) => {
    setPhase(p);
    setSecondsLeft(getDuration(p === 'idle' ? 'work' : p));
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;

        const currentPhase = phaseRef.current;
        if (currentPhase === 'work') {
          plantTree();
          const nextSessions = sessionsRef.current + 1;
          setSessionsCompleted(nextSessions);
          const useLong = nextSessions % settings.sessionsBeforeLongBreak === 0;
          const nextPhase: Phase = useLong ? 'longBreak' : 'break';
          setPhase(nextPhase);
          return getDuration(nextPhase);
        }
        setPhase('work');
        return getDuration('work');
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, settings.sessionsBeforeLongBreak, getDuration, plantTree]);

  const toggleRun = () => {
    if (phase === 'idle') {
      setPhase('work');
      setSecondsLeft(settings.workMinutes * 60);
    }
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setSessionsCompleted(0);
    resetToPhase('idle');
  };

  const workTotal = settings.workMinutes * 60;
  const currentGrowth =
    phase === 'work' && workTotal > 0
      ? Math.round(((workTotal - secondsLeft) / workTotal) * 100)
      : 0;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const total = getDuration(phase === 'idle' ? 'work' : phase);
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;

  const phaseLabel =
    phase === 'work'
      ? 'Focus'
      : phase === 'break'
        ? 'Short break'
        : phase === 'longBreak'
          ? 'Long break'
          : 'Ready';

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="glass-panel rounded-2xl overflow-hidden">
        <FocusForest
          trees={forest}
          currentGrowth={currentGrowth}
          isGrowing={running && phase === 'work'}
          phase={phase}
        />

        <div className="p-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000"
          style={{
            background: `conic-gradient(from 0deg, #22c55e ${phase === 'work' ? progress : 0}%, #3b82f6 ${progress}%, transparent ${progress}%)`,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              {phaseLabel}
            </span>
          </div>

          <div className="text-6xl sm:text-7xl font-black tabular-nums tracking-tight dark:text-white text-slate-800 my-6">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">
            Session {sessionsCompleted} · {settings.workMinutes}m work /{' '}
            {settings.breakMinutes}m break
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={toggleRun}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-3 rounded-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSettings((s) => !s)}
              className={`p-3 rounded-xl border transition-all ${
                showSettings
                  ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                  : 'border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
              }`}
              aria-label="Timer settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>
      </div>

      {phase === 'work' && !running && currentGrowth > 0 && currentGrowth < 100 && (
        <p className="text-center text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
          Paused — your sapling waits. Finish the session to plant it forever.
        </p>
      )}

      {showSettings && (
        <form
          className="glass-panel p-5 rounded-xl animate-entrance space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setShowSettings(false);
            if (!running && phase === 'idle') {
              setSecondsLeft(settings.workMinutes * 60);
            }
          }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">
            Interval settings
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                Work (min)
              </span>
              <input
                type="number"
                min={1}
                max={90}
                value={settings.workMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    workMinutes: Math.max(1, Number(e.target.value) || 25),
                  }))
                }
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                Break (min)
              </span>
              <input
                type="number"
                min={1}
                max={30}
                value={settings.breakMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    breakMinutes: Math.max(1, Number(e.target.value) || 5),
                  }))
                }
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                Long break (min)
              </span>
              <input
                type="number"
                min={1}
                max={45}
                value={settings.longBreakMinutes}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    longBreakMinutes: Math.max(1, Number(e.target.value) || 15),
                  }))
                }
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">
                Sessions before long
              </span>
              <input
                type="number"
                min={2}
                max={8}
                value={settings.sessionsBeforeLongBreak}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    sessionsBeforeLongBreak: Math.max(
                      2,
                      Number(e.target.value) || 4,
                    ),
                  }))
                }
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Save settings
          </button>
        </form>
      )}
    </div>
  );
}
