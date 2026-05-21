import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useTheme } from '../hooks/useTheme';
import { useHabits } from '../hooks/useHabits';
import { useLocalStorageString } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { BRAND } from '../constants/brand';
import { calculateStreak } from '../utils';
import type { ThemeMode } from '../types';

export function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { habits } = useHabits();
  const [username, setUsername] = useLocalStorageString(
    STORAGE_KEYS.username,
    BRAND.defaultUsername,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const maxStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h) => calculateStreak(h.logs).currentStreak));
  }, [habits]);

  const bgClass =
    theme === 'dark'
      ? 'bg-[#040405] text-[#f8fafc]'
      : 'bg-[#eef1f6] text-[#0f172a]';

  return (
    <div className={`min-h-screen w-full transition-all duration-500 overflow-x-hidden ${bgClass}`}>
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none select-none -z-10 opacity-30">
        <div
          className={`absolute -top-[40%] left-[10%] w-[500px] h-[500px] rounded-full blur-[130px] transition-all duration-700 ${
            theme === 'dark' ? 'bg-indigo-600/15' : 'bg-indigo-300/10'
          }`}
        />
        <div
          className={`absolute -top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[130px] transition-all duration-700 ${
            theme === 'dark' ? 'bg-blue-600/15' : 'bg-blue-300/10'
          }`}
        />
      </div>

      <Sidebar
        theme={theme as ThemeMode}
        onToggleTheme={toggleTheme}
        username={username}
        onUsernameChange={setUsername}
        maxStreak={maxStreak}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onMobileOpen={() => setMobileOpen(true)}
      />

      <main className="lg:pl-[4.5rem] min-h-screen pb-20 relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-16 lg:pt-6 selection:bg-blue-500/30 transition-[padding] duration-300">
        <Outlet context={{ theme, username }} />
      </main>
    </div>
  );
}
