import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  CloudRain,
  Trees,
  Coffee,
  Waves,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useSoundscape } from '../../hooks/useSoundscape';
import { useSoundscapeKeyboard, SOUNDSCAPE_SHORTCUT_HINT } from '../../hooks/useSoundscapeKeyboard';
import { SOUNDSCAPE_TRACKS } from '../../lib/soundscape/tracks';
import type { SoundscapeId } from '../../lib/soundscape/types';
import { getTrack } from '../../lib/soundscape/tracks';

const TRACK_ICONS: Record<SoundscapeId, typeof CloudRain> = {
  rain: CloudRain,
  forest: Trees,
  cafe: Coffee,
  white_noise: Waves,
};

export function SoundscapeMiniPlayer() {
  const soundscape = useSoundscape();
  const {
    settings,
    setSettings,
    isPlaying,
    isUnlocked,
    unlock,
    togglePlay,
    selectTrack,
    setVolume,
    setMuted,
  } = soundscape;

  const [expanded, setExpanded] = useState(false);
  useSoundscapeKeyboard(soundscape);

  const active = getTrack(settings.trackId);
  const ActiveIcon = TRACK_ICONS[settings.trackId];

  const handlePlay = useCallback(async () => {
    await unlock();
    await togglePlay();
  }, [unlock, togglePlay]);

  const handleSelect = useCallback(
    async (id: SoundscapeId) => {
      await selectTrack(id);
    },
    [selectTrack],
  );

  return (
    <div
      className="soundscape-player pointer-events-none"
      aria-label="Focus soundscape"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-2 max-w-[min(100vw-2rem,20rem)]">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
              className="soundscape-player-panel w-72 rounded-2xl border border-[var(--border-light)] bg-[var(--glass-background)] shadow-[var(--shadow-resting)] p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-600/90 dark:text-cyan-400/90 mb-2.5">
                Soundscape
              </p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {SOUNDSCAPE_TRACKS.map((track) => {
                  const Icon = TRACK_ICONS[track.id];
                  const selected = settings.trackId === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => void handleSelect(track.id)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                        selected
                          ? 'bg-cyan-600/15 border border-cyan-500/35 text-cyan-700 dark:text-cyan-300'
                          : 'border border-transparent hover:bg-white/5 light-theme:hover:bg-slate-900/5 text-[var(--text-secondary)]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
                      <span className="text-[11px] font-medium leading-tight">{track.label}</span>
                    </button>
                  );
                })}
              </div>

              <label className="flex items-center gap-2 mb-2">
                <Volume2 className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" strokeWidth={1.75} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(settings.volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="soundscape-volume flex-1 h-1 accent-cyan-600"
                  aria-label="Soundscape volume"
                />
                <span className="text-[10px] font-mono text-[var(--text-muted)] w-7 text-right tabular-nums">
                  {Math.round(settings.volume * 100)}
                </span>
              </label>

              <label className="flex items-center justify-between gap-2 py-1.5 cursor-pointer">
                <span className="text-[11px] text-[var(--text-secondary)]">Sync with focus timer</span>
                <input
                  type="checkbox"
                  checked={settings.syncWithTimer}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, syncWithTimer: e.target.checked }))
                  }
                  className="w-9 h-5 rounded-full appearance-none bg-slate-300 dark:bg-slate-700 checked:bg-cyan-600 relative shrink-0 cursor-pointer transition-colors
                    before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                    checked:before:translate-x-4"
                  style={{ position: 'relative' }}
                />
              </label>

              <label className="flex items-center justify-between gap-2 py-1 cursor-pointer">
                <span className="text-[11px] text-[var(--text-secondary)]">Softer during breaks</span>
                <input
                  type="checkbox"
                  checked={settings.duckOnBreak}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, duckOnBreak: e.target.checked }))
                  }
                  disabled={!settings.syncWithTimer}
                  className="w-9 h-5 rounded-full appearance-none bg-slate-300 dark:bg-slate-700 checked:bg-cyan-600 relative shrink-0 cursor-pointer transition-colors disabled:opacity-40
                    before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform
                    checked:before:translate-x-4"
                  style={{ position: 'relative' }}
                />
              </label>

              <p className="text-[9px] text-[var(--text-muted)] mt-2 leading-relaxed font-mono">
                {SOUNDSCAPE_SHORTCUT_HINT}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="soundscape-player-bar flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full border border-[var(--border-light)] bg-[var(--glass-background)]/95 backdrop-blur-2xl shadow-lg shadow-black/20">
          <button
            type="button"
            onClick={() => void handlePlay()}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-cyan-600/90 hover:bg-cyan-500 text-white transition-colors shrink-0"
            aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-2 min-w-0 px-1 py-1 rounded-full hover:bg-white/5 light-theme:hover:bg-slate-900/5 transition-colors"
            aria-expanded={expanded}
            aria-label="Soundscape options"
          >
            <ActiveIcon className="w-3.5 h-3.5 text-cyan-600/80 dark:text-cyan-400/80 shrink-0" strokeWidth={1.75} />
            <span className="text-[11px] font-medium text-[var(--text-primary)] truncate max-w-[5.5rem] sm:max-w-[7rem]">
              {active.label}
            </span>
            {expanded ? (
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
            ) : (
              <ChevronUp className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMuted(!settings.muted)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 light-theme:hover:bg-slate-900/5 transition-colors shrink-0"
            aria-label={settings.muted ? 'Unmute' : 'Mute'}
          >
            {settings.muted ? (
              <VolumeX className="w-3.5 h-3.5" strokeWidth={1.75} />
            ) : (
              <Volume2 className="w-3.5 h-3.5" strokeWidth={1.75} />
            )}
          </button>

          {!isUnlocked && (
            <span className="sr-only">Tap play to enable audio</span>
          )}
        </div>
      </div>
    </div>
  );
}
