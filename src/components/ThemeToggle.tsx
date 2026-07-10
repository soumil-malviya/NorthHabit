import { motion } from 'motion/react';
import type { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  compact?: boolean;
  iconOnly?: boolean;
}

export function ThemeToggle({ theme, onToggle, compact = false, iconOnly = false }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="theme-switch theme-switch--icon"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-pressed={isDark}
      >
        <span className="theme-switch-track" aria-hidden>
          <motion.span
            className="theme-switch-thumb"
            layout
            transition={{ type: 'spring', stiffness: 520, damping: 36 }}
            style={{ left: isDark ? 'calc(100% - 1.15rem)' : '0.1rem' }}
          />
          <span className={`theme-switch-face ${isDark ? '' : 'is-visible'}`} aria-hidden>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-8.9-6.2A7 7 0 0 1 12 3z" />
            </svg>
          </span>
          <span className={`theme-switch-face ${isDark ? 'is-visible' : ''}`} aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
            </svg>
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`theme-switch ${compact ? 'theme-switch--compact' : 'theme-switch--full'}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
    >
      <span className="theme-switch-track" aria-hidden>
        <motion.span
          className="theme-switch-thumb"
          layout
          transition={{ type: 'spring', stiffness: 520, damping: 36 }}
          style={{ left: isDark ? 'calc(100% - 1.15rem)' : '0.1rem' }}
        />
        <span className={`theme-switch-face ${isDark ? '' : 'is-visible'}`} aria-hidden>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-8.9-6.2A7 7 0 0 1 12 3z" />
          </svg>
        </span>
        <span className={`theme-switch-face ${isDark ? 'is-visible' : ''}`} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
          </svg>
        </span>
      </span>
      {!compact ? (
        <span className="theme-switch-label">{isDark ? 'Dark' : 'Light'}</span>
      ) : (
        <span className="theme-switch-label hidden group-hover/sb:inline">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
