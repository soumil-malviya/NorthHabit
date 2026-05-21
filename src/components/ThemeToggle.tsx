import type { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
  compact?: boolean;
}

export function ThemeToggle({ theme, onToggle, compact = false }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex items-center justify-center rounded-xl transition-all duration-300 ${
        compact
          ? 'w-10 h-10 mx-auto group-hover/sb:w-full group-hover/sb:gap-2 group-hover/sb:py-2.5 group-hover/sb:px-3 group-hover/sb:border group-hover/sb:border-slate-200 dark:group-hover/sb:border-white/5 group-hover/sb:hover:bg-slate-100 dark:group-hover/sb:hover:bg-white/[0.05]'
          : 'w-full gap-2 py-2.5 px-3 border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
      }`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={`absolute inset-0 rounded-xl blur-md transition-opacity duration-500 ${
          isDark
            ? 'bg-amber-400/0 group-hover:bg-amber-400/25'
            : 'bg-indigo-500/0 group-hover:bg-indigo-500/20'
        }`}
        aria-hidden
      />
      <span className="relative flex items-center justify-center w-9 h-9">
        {/* Sun — visible in dark mode (click to go light) */}
        <span
          className={`absolute transition-all duration-500 ${
            isDark
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-50 rotate-90 pointer-events-none'
          }`}
        >
          <span
            className="absolute inset-0 rounded-full bg-amber-400/40 blur-lg scale-150"
            aria-hidden
          />
          <svg
            viewBox="0 0 24 24"
            className="relative w-7 h-7 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]"
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
            className="absolute inset-0 rounded-full bg-indigo-400/35 blur-lg scale-150"
            aria-hidden
          />
          <svg
            viewBox="0 0 24 24"
            className="relative w-7 h-7 text-indigo-300 drop-shadow-[0_0_14px_rgba(129,140,248,0.9)]"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-8.9-6.2A7 7 0 0 1 12 3z" />
          </svg>
        </span>
      </span>
      {compact ? (
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
