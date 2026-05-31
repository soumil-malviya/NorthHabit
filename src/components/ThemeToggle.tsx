import type { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  compact?: boolean;
  /** Compact icon button for headers and toolbars */
  iconOnly?: boolean;
}

export function ThemeToggle({ theme, onToggle, compact = false, iconOnly = false }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex items-center justify-center rounded-xl transition-all duration-300 ${
        iconOnly
          ? 'w-10 h-10 border border-[var(--border-light)] hover:bg-[var(--surface-hover)] shrink-0'
          : compact
            ? 'w-10 h-10 mx-auto group-hover/sb:w-full group-hover/sb:gap-2 group-hover/sb:py-2.5 group-hover/sb:px-3 group-hover/sb:border group-hover/sb:border-[var(--border-light)] group-hover/sb:hover:bg-[var(--surface-hover)]'
            : 'w-full gap-2 py-2.5 px-3 border border-[var(--border-light)] hover:bg-[var(--surface-hover)]'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="absolute inset-0 rounded-xl bg-[var(--surface-muted)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      <span className={`relative flex items-center justify-center ${iconOnly ? 'w-8 h-8' : 'w-9 h-9'}`}>
        {/* Sun — visible in dark mode (click to go light) */}
        <span
          className={`absolute transition-all duration-500 ${
            isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 rotate-90 pointer-events-none'
          }`}
        >
          <span
            className="absolute inset-0 rounded-full bg-amber-400/12 scale-125"
            aria-hidden
          />
          <svg
            viewBox="0 0 24 24"
            className="relative w-7 h-7 text-amber-500"
            fill="currentColor"
            aria-hidden
          >
            <circle cx="12" cy="12" r="4" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <rect
                key={deg}
                x="11"
                y="1"
                width="2"
                height="3"
                rx="1"
                transform={`rotate(${deg} 12 12)`}
                opacity="0.9"
              />
            ))}
          </svg>
        </span>
        {/* Moon — visible in light mode */}
        <span
          className={`absolute transition-all duration-500 ${
            !isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 -rotate-90 pointer-events-none'
          }`}
        >
          <span
            className="absolute inset-0 rounded-full bg-slate-400/12 scale-125"
            aria-hidden
          />
          <svg
            viewBox="0 0 24 24"
            className="relative w-7 h-7 text-slate-500 dark:text-slate-300"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-8.9-6.2A7 7 0 0 1 12 3z" />
          </svg>
        </span>
      </span>
      {iconOnly ? null : compact ? (
        <span className="relative hidden group-hover/sb:inline text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      ) : (
        <span className="relative text-xs font-semibold text-slate-600 dark:text-slate-400">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
}
