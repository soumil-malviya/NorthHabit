import { Flame } from 'lucide-react';
import { UsernameChip } from './UsernameChip';
import { ThemeToggle } from './ThemeToggle';
import type { ThemeMode } from '../types';

interface UserProfileControlsProps {
  username: string;
  onUsernameChange: (name: string) => void;
  maxStreak: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function UserProfileControls({
  username,
  onUsernameChange,
  maxStreak,
  theme,
  onToggleTheme,
}: UserProfileControlsProps) {
  return (
    <div className="profile-controls">
      <UsernameChip username={username} onUsernameChange={onUsernameChange} />

      <div
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/25 text-orange-500 dark:text-orange-400 shrink-0"
        title={`${maxStreak} day streak`}
      >
        <Flame className="w-3.5 h-3.5" />
        <span className="text-xs font-bold font-mono tabular-nums">{maxStreak}</span>
        <span className="text-[9px] font-bold uppercase tracking-wide opacity-75 hidden sm:inline">
          day{maxStreak === 1 ? '' : 's'}
        </span>
      </div>

      <ThemeToggle theme={theme} onToggle={onToggleTheme} iconOnly />
    </div>
  );
}
