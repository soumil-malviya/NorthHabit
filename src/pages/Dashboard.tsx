import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { UserProfileControls } from '../components/UserProfileControls';
import { AmbientSettingsPanel } from '../components/ambient/AmbientSettingsPanel';
import type { AppOutletContext } from '../types/appContext';
import { 
  Plus, 
  Trash2, 
  Check, 
  Flame, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Heart, 
  Palette, 
  Briefcase, 
  Activity, 
  X, 
  Clock, 
  Timer,
  ArrowUpRight, 
  Download, 
  Upload,
  AlertCircle,
  ListPlus,
} from 'lucide-react';
import { CategoryType, FrequencyType, DifficultyType, Habit } from '../types';
import {
  getLocalDateString,
  formatFriendlyDate,
  getPastDates,
  calculateStreak,
} from '../utils';
import { useHabits } from '../hooks/useHabits';
import {
  getCategoryColorClass,
  getDifficultyColorClass,
  getCategoryThemeClass,
  getCategoryIcon,
} from '../lib/categoryStyles';
import { BRAND } from '../constants/brand';

export default function Dashboard() {
  const { username, setUsername, maxStreak, theme, toggleTheme } =
    useOutletContext<AppOutletContext>();
  const location = useLocation();

  // ----------------------------------------------------
  // States
  // ----------------------------------------------------
  const { habits, setHabits } = useHabits();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsageOffset, setSelectedUsageOffset] = useState(0);
  
  // Mobile declutter expanders
  const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [latency, setLatency] = useState(14);

  // Form fields state
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<CategoryType>('health');
  const [newHabitFrequency, setNewHabitFrequency] = useState<FrequencyType>('daily');
  const [newHabitDifficulty, setNewHabitDifficulty] = useState<DifficultyType>('easy');
  const [newHabitTargetMinutes, setNewHabitTargetMinutes] = useState(10);
  const [formError, setFormError] = useState('');

  // Past 7 Days List (oldest on left, today on right)
  const past7Days = useMemo(() => getPastDates(7), []);
  // Past 30 Days List (oldest on left, today on right)
  const past30Days = useMemo(() => getPastDates(30), []);
  const todayDateStr = useMemo(() => getLocalDateString(0), []);

  // ----------------------------------------------------
  // Effects
  // ----------------------------------------------------
  // Simulate latency fluctuations (between 11ms and 19ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const dev = Math.random() > 0.5 ? 1 : -1;
        const next = prev + dev;
        return next >= 10 && next <= 25 ? next : prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // Interactive Actions
  // ----------------------------------------------------
  const handleAddNewHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      setFormError('Please provide a habit name.');
      return;
    }

    const minutes = Math.max(1, Math.min(240, Math.round(newHabitTargetMinutes)));

    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newHabitName.trim(),
      description: newHabitDesc.trim(),
      category: newHabitCategory,
      frequency: newHabitFrequency,
      difficulty: newHabitDifficulty,
      targetMinutes: minutes,
      createdAt: getLocalDateString(0),
      logs: []
    };

    setHabits(prev => [newHabit, ...prev]);
    
    // Reset Form Fields
    setNewHabitName('');
    setNewHabitDesc('');
    setNewHabitCategory('health');
    setNewHabitFrequency('daily');
    setNewHabitDifficulty('easy');
    setNewHabitTargetMinutes(10);
    setFormError('');
    setIsAddingHabit(false);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    if (deletingHabitId === id) {
      setDeletingHabitId(null);
    }
  };

  // Toggle log for any day in history
  const handleToggleLogDay = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const isLogged = habit.logs.includes(dateStr);
        const updatedLogs = isLogged
          ? habit.logs.filter(d => d !== dateStr) // Unchecking: remove
          : [...habit.logs, dateStr];           // Checking: append

        return {
          ...habit,
          logs: updatedLogs
        };
      }
      return habit;
    }));
  };

  const getHabitTargetMinutes = (habit: Pick<Habit, 'targetMinutes'>) => {
    if (typeof habit.targetMinutes === 'number' && Number.isFinite(habit.targetMinutes)) {
      return Math.max(1, Math.min(240, Math.round(habit.targetMinutes)));
    }
    return 10;
  };

  const handleUpdateTargetMinutes = (habitId: string, minutes: number) => {
    const next = Math.max(1, Math.min(240, Math.round(minutes || 1)));
    setHabits(prev =>
      prev.map(habit =>
        habit.id === habitId
          ? { ...habit, targetMinutes: next }
          : habit,
      ),
    );
  };

  // ----------------------------------------------------
  // Derived Stats Calculations
  // ----------------------------------------------------
  const habitsWithStats = useMemo(() => {
    return habits.map(h => {
      const { currentStreak, longestStreak } = calculateStreak(h.logs);
      const completedToday = h.logs.includes(todayDateStr);
      return {
        ...h,
        currentStreak,
        longestStreak,
        completedToday
      };
    });
  }, [habits, todayDateStr]);

  // General Filter processing
  const filteredHabits = useMemo(() => {
    return habitsWithStats.filter(h => {
      const matchCategory = activeCategoryFilter === 'all' || h.category === activeCategoryFilter;
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchCompletion = true;
      if (completionFilter === 'completed') matchCompletion = h.completedToday;
      if (completionFilter === 'pending') matchCompletion = !h.completedToday;

      return matchCategory && matchSearch && matchCompletion;
    });
  }, [habitsWithStats, activeCategoryFilter, completionFilter, searchQuery]);

  // Compute overall stats metrics
  const totalActiveHabitsCount = habits.length;
  
  const todayCompletedCount = useMemo(() => {
    return habitsWithStats.filter(h => h.completedToday).length;
  }, [habitsWithStats]);

  const todayCompletionRate = useMemo(() => {
    if (totalActiveHabitsCount === 0) return 0;
    return Math.round((todayCompletedCount / totalActiveHabitsCount) * 100);
  }, [todayCompletedCount, totalActiveHabitsCount]);

  const maxActiveStreak = useMemo(() => {
    if (habitsWithStats.length === 0) return 0;
    return Math.max(...habitsWithStats.map(h => h.currentStreak));
  }, [habitsWithStats]);

  const topStreakHabit = useMemo(() => {
    return habitsWithStats.reduce<(typeof habitsWithStats)[number] | null>((best, habit) => {
      if (!best || habit.currentStreak > best.currentStreak) return habit;
      return best;
    }, null);
  }, [habitsWithStats]);

  const pendingTodayCount = Math.max(totalActiveHabitsCount - todayCompletedCount, 0);

  // Overall satisfaction score based on past 30 days complete rate
  const consistencyIndex = useMemo(() => {
    if (habits.length === 0) return 0;
    // Inspect past 30 days counts
    let totalPossibleLogs = habits.length * 30;
    let actualLogsCount = 0;
    
    const past30DayStrings = [];
    for (let i = 0; i < 30; i++) {
      past30DayStrings.push(getLocalDateString(-i));
    }

    habits.forEach(h => {
      const intersection = h.logs.filter(logDay => past30DayStrings.includes(logDay));
      actualLogsCount += intersection.length;
    });

    return Math.round((actualLogsCount / totalPossibleLogs) * 100);
  }, [habits]);

  // ----------------------------------------------------
  // Backup / Import functions for self-hosting safety
  // ----------------------------------------------------
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(habits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `habit-tracker-backup-${getLocalDateString(0)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (files && files.length > 0) {
      fileReader.readAsText(files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event?.target?.result as string);
          if (Array.isArray(parsed) && parsed.every(h => h.id && h.name)) {
            setHabits(parsed);
            alert('Habits loaded successfully from backup.');
          } else {
            alert('Invalid backup file structure.');
          }
        } catch (err) {
          alert('Failed to parse backup JSON.');
        }
      };
    }
  };

  // ----------------------------------------------------
  // Dynamic Activity Monitor Calculations
  // ----------------------------------------------------
  const selectedUsageDateStr = useMemo(() => {
    return getLocalDateString(-selectedUsageOffset);
  }, [selectedUsageOffset]);

  const selectedUsageDateLabel = useMemo(() => {
    if (selectedUsageOffset === 0) return 'Today';
    if (selectedUsageOffset === 1) return 'Yesterday';
    return formatFriendlyDate(selectedUsageDateStr);
  }, [selectedUsageOffset, selectedUsageDateStr]);

  // Helper: get minutes completed for a given date
  const getMinutesForDay = (dayStr: string) => {
    let mins = 0;
    habits.forEach(h => {
      if (h.logs.includes(dayStr)) {
        mins += getHabitTargetMinutes(h);
      }
    });
    return mins;
  };

  const completedMinutesByDayList = useMemo(() => {
    // past30Days is oldest on left, today on right
    return [...past30Days].reverse().map(dateStr => {
      let health = 0;
      let fitness = 0;
      let mindfulness = 0;
      let work = 0;
      let creative = 0;

      habits.forEach(h => {
        if (h.logs.includes(dateStr)) {
          const weight = getHabitTargetMinutes(h);
          if (h.category === 'health') health += weight;
          else if (h.category === 'fitness') fitness += weight;
          else if (h.category === 'mindfulness') mindfulness += weight;
          else if (h.category === 'work') work += weight;
          else if (h.category === 'creative') creative += weight;
        }
      });

      const total = health + fitness + mindfulness + work + creative;
      
      const d = new Date(dateStr.split('-').map(Number)[0], dateStr.split('-').map(Number)[1] - 1, dateStr.split('-').map(Number)[2]);
      const weekdayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const shortDayName = weekdayNamesShort[d.getDay()];

      return {
        dateStr,
        dayLabel: `${d.getDate()}`,
        dayOfWeek: shortDayName,
        total,
        health,
        fitness,
        mindfulness,
        work,
        creative,
      };
    });
  }, [habits, past30Days]);

  const maxMinutesInWeek = useMemo(() => {
    const maxVal = Math.max(...completedMinutesByDayList.map(d => d.total));
    return maxVal > 0 ? maxVal : 45;
  }, [completedMinutesByDayList]);

  // Max scale height limit (grid lines at total, half, 0)
  const chartHeightScaleMinutes = useMemo(() => {
    if (maxMinutesInWeek <= 30) return 30;
    if (maxMinutesInWeek <= 60) return 60;
    if (maxMinutesInWeek <= 120) return 120;
    if (maxMinutesInWeek <= 180) return 180;
    return Math.ceil(maxMinutesInWeek / 30) * 30;
  }, [maxMinutesInWeek]);

  // Selected day minutes data of active categories
  const selectedDayMinutesData = useMemo(() => {
    let health = 0;
    let fitness = 0;
    let mindfulness = 0;
    let work = 0;
    let creative = 0;

    habits.forEach(h => {
      if (h.logs.includes(selectedUsageDateStr)) {
        const weight = getHabitTargetMinutes(h);
        if (h.category === 'health') health += weight;
        else if (h.category === 'fitness') fitness += weight;
        else if (h.category === 'mindfulness') mindfulness += weight;
        else if (h.category === 'work') work += weight;
        else if (h.category === 'creative') creative += weight;
      }
    });

    const total = health + fitness + mindfulness + work + creative;
    return { total, health, fitness, mindfulness, work, creative };
  }, [habits, selectedUsageDateStr]);

  const averageMinutes30Days = useMemo(() => {
    let totalMins = 0;
    for (let i = 0; i < 30; i++) {
      const dStr = getLocalDateString(-i);
      totalMins += getMinutesForDay(dStr);
    }
    return Math.round(totalMins / 30);
  }, [habits]);

  const formatMinutesFriendly = (totalMins: number) => {
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours > 0) {
      if (mins > 0) return `${hours}h ${mins}m`;
      return `${hours}h`;
    }
    return `${mins}m`;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') !== 'today') return;
    setSearchQuery('');
    setActiveCategoryFilter('all');
    setCompletionFilter('all');
    window.setTimeout(() => {
      document.getElementById('habits-matrix-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') !== 'add-habit') return;
    setIsAddingHabit(true);
    window.setTimeout(() => {
      document.getElementById('form-habit-name')?.focus();
    }, 120);
  }, [location.search]);

  return (
    <div>
        <header
          className="pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-white/5 mb-6"
          id="tracker-header"
        >
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-tight dark:text-white text-slate-850">Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track habits and build streaks</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap sm:justify-end">
            <UserProfileControls
              username={username}
              onUsernameChange={setUsername}
              maxStreak={maxStreak}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 duration-200 cursor-pointer shrink-0 ${
                isSettingsOpen
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                  : 'bg-white/[0.02] border border-slate-300 dark:border-white/5 text-slate-400 dark:hover:text-white hover:text-slate-800'
              }`}
              title="Backup settings"
              id="settings-toggle-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

      {/* ----------------- COLLAPSIBLE SETTINGS & BACKUP DRAWER ----------------- */}
      {isSettingsOpen && (
        <div className="glass-panel p-4 rounded-xl mb-6 border-cyan-500/20 shadow-xl animate-entrance" id="settings-drawer">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Settings & Personalization</h4>
            <span className="text-[9px] dark:text-slate-450 text-slate-500 font-mono">Status: LocalStorage Connected</span>
          </div>
          <p className="text-xs dark:text-slate-400 text-slate-600 mb-4 leading-relaxed">
            Configure your display preference or download static backups. All your data resides locally on your client device.
          </p>
          
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleExportData}
              className="flex-1 py-2 px-3 bg-slate-200/50 dark:bg-white/[0.03] hover:bg-slate-300/60 dark:hover:bg-white/[0.08] dark:text-slate-100 text-slate-800 rounded-lg text-xs font-mono border border-slate-300 dark:border-white/5 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              id="export-btn"
            >
              <Download className="w-3.5 h-3.5" /> Export Data JSON
            </button>
            <label
              className="flex-1 py-2 px-3 bg-slate-200/50 dark:bg-white/[0.03] hover:bg-slate-300/60 dark:hover:bg-white/[0.08] dark:text-slate-100 text-slate-800 rounded-lg text-xs font-mono border border-slate-300 dark:border-white/5 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
              id="import-btn"
            >
              <Upload className="w-3.5 h-3.5" /> Import Data JSON
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportData} 
                className="hidden" 
              />
            </label>
          </div>

          <AmbientSettingsPanel theme={theme} />
        </div>
      )}

      {/* ----------------- MOBILE & LAPTOP OPTIMIZED STATS GRID ----------------- */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4 mb-6" id="tracker-stats-grid">
        
        {/* Stats Card 1: Today's Completion */}
        <div className="glass-panel p-3 sm:p-4 rounded-xl flex flex-col justify-between overflow-hidden relative" id="stat-card-today">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500 block sm:mb-1">Today</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-2xl font-black dark:text-white text-slate-800">{todayCompletedCount}</span>
              <span className="text-[10px] dark:text-slate-500 text-slate-600">/{totalActiveHabitsCount}</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-300 dark:bg-slate-800 rounded-full h-1 sm:h-1.5 overflow-hidden border border-slate-300 dark:border-white/5">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${todayCompletionRate}%` }}
              />
            </div>
            <span className="text-[8px] font-mono dark:text-slate-500 text-slate-600 mt-1 block text-right">{todayCompletionRate}% Done</span>
          </div>
        </div>

        {/* Stats Card 2: Highest Active Streak */}
        <div className="glass-panel p-3 sm:p-4 rounded-xl flex flex-col justify-between overflow-hidden relative" id="stat-card-streak">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500 block sm:mb-1">Best Burn</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-2xl font-black dark:text-white text-slate-800">{maxActiveStreak}</span>
              <span className="text-[10px] text-orange-550 dark:text-orange-400 font-mono font-bold">days</span>
            </div>
          </div>
          <div className="mt-2 dark:text-slate-400 text-slate-600 text-[9px] flex items-center gap-1 font-mono">
            <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400 active-streak-flame" />
            <span>Active Fire</span>
          </div>
        </div>

        {/* Stats Card 3: Consistency Score */}
        <div className="glass-panel p-3 sm:p-4 rounded-xl flex flex-col justify-between overflow-hidden relative" id="stat-card-aura">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500 block sm:mb-1">Consistency Index</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-2xl font-black dark:text-white text-slate-800">{consistencyIndex}%</span>
            </div>
          </div>
          <div className="mt-2 dark:text-slate-400 text-slate-600 text-[9px] flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
            <span>Consistency</span>
          </div>
        </div>

      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-3 mb-6" id="dashboard-shortcuts">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 overflow-hidden relative">
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Streak overview
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-850 dark:text-white">
                  {maxActiveStreak}
                </span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-300">
                  day active streak
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">
                {topStreakHabit
                  ? `${topStreakHabit.name} is leading today`
                  : 'Add a routine to start building momentum'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[15rem]">
              <Link to="/app/pomodoro?action=start" className="dashboard-shortcut-card">
                <Timer className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
                <span>Focus</span>
              </Link>
              <Link to="/app?view=today" className="dashboard-shortcut-card">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                <span>Today</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Native shortcuts
            </p>
            <p className="text-sm font-extrabold text-slate-850 dark:text-white mt-1">
              {pendingTodayCount === 0 ? 'All clear today' : `${pendingTodayCount} habits left`}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Use the floating button or Alt Shift A/F/H.
            </p>
          </div>
          <Link
            to="/app/todo?action=add"
            className="w-11 h-11 rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center active:scale-95 transition-all shrink-0"
            aria-label="Quick-add task"
          >
            <ListPlus className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ----------------- FILTER SHEETS & ACTIONS ----------------- */}
      <div className="space-y-4 mb-6" id="filters-container">
        
        {/* Swipable scroll container for category filters on Mobile */}
        <div className="relative">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-2 px-2" id="category-filter-bar">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                activeCategoryFilter === 'all'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/10 border-cyan-600'
                  : 'bg-slate-200/60 hover:bg-slate-300/80 dark:bg-white/[0.02] text-slate-700 dark:text-slate-400 dark:hover:text-white border-slate-300 dark:border-white/5'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setActiveCategoryFilter('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 border cursor-pointer ${
                activeCategoryFilter === 'health'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200/60 hover:bg-slate-300/80 dark:bg-white/[0.01] border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> Health
            </button>
            <button
              onClick={() => setActiveCategoryFilter('fitness')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 border cursor-pointer ${
                activeCategoryFilter === 'fitness'
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
                  : 'bg-slate-200/60 hover:bg-slate-300/80 dark:bg-white/[0.01] border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Fitness
            </button>
            <button
              onClick={() => setActiveCategoryFilter('mindfulness')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 border cursor-pointer ${
                activeCategoryFilter === 'mindfulness'
                  ? 'bg-violet-500/20 border-violet-500/30 text-violet-700 dark:text-violet-300'
                  : 'bg-slate-200/60 hover:bg-slate-300/80 dark:bg-white/[0.01] border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Mindfulness
            </button>
            <button
              onClick={() => setActiveCategoryFilter('work')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 border cursor-pointer ${
                activeCategoryFilter === 'work'
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-200/60 hover:bg-slate-300/80 dark:bg-white/[0.01] border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Work
            </button>
            <button
              onClick={() => setActiveCategoryFilter('creative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 border cursor-pointer ${
                activeCategoryFilter === 'creative'
                  ? 'bg-pink-500/20 border-pink-500/30 text-pink-700 dark:text-pink-300'
                  : 'bg-slate-200/60 hover:bg-slate-300/80 dark:bg-white/[0.01] border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Creative
            </button>
          </div>
        </div>

        {/* Inputs and Add actions row */}
        <div className="flex flex-col sm:flex-row gap-2" id="search-action-bar">
          
          {/* Quick Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search routines & notes..."
              className="bg-slate-200/60 dark:bg-slate-900/40 text-xs w-full text-slate-800 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 border border-slate-300 dark:border-white/5 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              id="search-input"
            />
          </div>

          <div className="flex gap-2">
            {/* Today Complete Filter Toggle Bar */}
            <div className="flex border border-slate-300 dark:border-white/5 bg-slate-200/65 dark:bg-slate-900/40 p-1 rounded-xl font-sans text-xs flex-1 sm:flex-initial" id="completion-filter-pills">
              <button
                onClick={() => setCompletionFilter('all')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-all font-bold ${
                  completionFilter === 'all' 
                    ? 'bg-white dark:bg-white/10 text-slate-850 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white'
                }`}
                id="complete-filter-all"
              >
                All
              </button>
              <button
                onClick={() => setCompletionFilter('completed')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-all font-bold ${
                  completionFilter === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                }`}
                id="complete-filter-done"
              >
                Done
              </button>
              <button
                onClick={() => setCompletionFilter('pending')}
                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-all font-bold ${
                  completionFilter === 'pending' 
                    ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300'
                }`}
                id="complete-filter-pending"
              >
                Pending
              </button>
            </div>

            {/* Main trigger button */}
            <button
              onClick={() => setIsAddingHabit(prev => !prev)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 shadow-lg shadow-cyan-500/15 cursor-pointer"
              id="toggle-add-form-btn"
            >
              {isAddingHabit ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAddingHabit ? 'Close' : 'Add Routine'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- COLLAPSIBLE SIMPLIFIED FORM ENGINE ----------------- */}
      {isAddingHabit && (
        <form 
          onSubmit={handleAddNewHabit}
          className="glass-panel p-5 rounded-xl mb-6 border-cyan-500/20 shadow-xl animate-entrance"
          id="add-habit-form"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Add a New Habit Routine
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              id="cancel-add-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg mb-4 text-xs text-red-400 flex items-center gap-2" id="form-error-banner">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-4">
            
            {/* Primary Details */}
            <div>
              <label className="block text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">What habit routine do you want to build?</label>
              <input
                type="text"
                required
                placeholder="e.g. Morning 10m Meditation, Run 5km, Drink water..."
                value={newHabitName}
                onChange={(e) => {
                  setNewHabitName(e.target.value);
                  if (formError) setFormError('');
                }}
                className="w-full bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-3 rounded-xl font-sans text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                id="form-habit-name"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Notes or short description (Optional)</label>
              <input
                type="text"
                placeholder="Brief reason or cue context..."
                value={newHabitDesc}
                onChange={(e) => setNewHabitDesc(e.target.value)}
                className="w-full bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-3 rounded-xl font-sans text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                id="form-habit-desc"
              />
            </div>

            {/* Select Options layout */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              <div>
                <label className="block text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Category</label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-2.5 rounded-xl text-xs text-slate-850 dark:text-white cursor-pointer focus:border-cyan-500"
                  id="form-habit-category"
                >
                  <option className="bg-slate-100 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400" value="health">health 🍏</option>
                  <option className="bg-slate-100 dark:bg-slate-950 text-cyan-600 dark:text-cyan-400" value="fitness">fitness 💪</option>
                  <option className="bg-slate-100 dark:bg-slate-950 text-violet-600 dark:text-violet-400" value="mindfulness">mindfulness 🧘</option>
                  <option className="bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-400" value="work">work 💻</option>
                  <option className="bg-slate-100 dark:bg-slate-950 text-pink-600 dark:text-pink-400" value="creative">creative 🎨</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Frequency</label>
                <select
                  value={newHabitFrequency}
                  onChange={(e) => setNewHabitFrequency(e.target.value as FrequencyType)}
                  className="w-full bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-2.5 rounded-xl text-xs text-slate-850 dark:text-white cursor-pointer focus:border-cyan-500"
                  id="form-habit-frequency"
                >
                  <option value="daily" className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white">daily</option>
                  <option value="weekly" className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white">weekly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">
                Time required
              </label>
              <label className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-3 rounded-xl">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={newHabitTargetMinutes}
                  onChange={(e) => setNewHabitTargetMinutes(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-semibold text-slate-850 dark:text-white focus:outline-none"
                  id="form-habit-target-minutes"
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  min
                </span>
              </label>
            </div>

            {/* Intensity levels selector */}
            <div>
              <label className="block text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Difficulty tag</label>
              <div className="grid grid-cols-3 gap-2" id="form-habit-difficulty-radios">
                {(['easy', 'medium', 'hard'] as DifficultyType[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setNewHabitDifficulty(diff)}
                    className={`py-2 border capitalize text-[11px] font-semibold rounded-xl transition-all ${
                      newHabitDifficulty === diff
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-200/55 dark:bg-white/[0.01] border-slate-300 dark:border-white/5 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2 mt-5 border-t border-white/5 pt-3">
            <button
              type="button"
              onClick={() => setIsAddingHabit(false)}
              className="px-4 py-2 hover:bg-white/5 text-slate-400 font-semibold text-xs rounded-xl active:scale-95 transition-all text-center"
              id="form-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl active:scale-95 transition-all text-center"
              id="form-submit-btn"
            >
              Add Routine
            </button>
          </div>
        </form>
      )}

      {/* ----------------- PRIMARY HABITS MATRIX LIST WITH MOBILE FOCUS ----------------- */}
      {filteredHabits.length === 0 ? (
        <div className="glass-panel py-12 px-5 rounded-2xl text-center flex flex-col items-center justify-center max-w-md mx-auto border border-slate-300 dark:border-white/5" id="empty-state-notice">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-3 text-cyan-400 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold dark:text-white text-slate-800 mb-1.5">No Routines Found</h3>
          <p className="text-xs dark:text-slate-400 text-slate-600 max-w-xs mx-auto leading-relaxed">
            {searchQuery || activeCategoryFilter !== 'all' || completionFilter !== 'all'
              ? "All filters checked & clear. Try resetting search parameters to see your routines."
              : "Kickstart your route tracker by adding routine targets. Complete meditation, run, or write logic to see trends!"}
          </p>
          {(searchQuery || activeCategoryFilter !== 'all' || completionFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategoryFilter('all');
                setCompletionFilter('all');
              }}
              className="mt-4 px-3 py-1.5 bg-slate-200 dark:bg-white/[0.03] hover:bg-slate-300/80 dark:hover:bg-white/[0.06] border border-slate-300 dark:border-white/5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
              id="clear-filters-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="habits-matrix-panel">
          {filteredHabits.map((habit) => {
            const currentFormattedStreak = habit.currentStreak;
            const isStreakActive = currentFormattedStreak > 0;

            return (
              <div
                key={habit.id}
                className={`glass-panel rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden relative duration-350 ${getCategoryThemeClass(habit.category)}`}
                style={{ contentVisibility: 'auto' }}
                id={`habit-card-${habit.id}`}
              >
                {/* Card Title Metadata */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-xl flex items-center justify-center">
                        {getCategoryIcon(habit.category)}
                      </div>
                      <div>
                        {/* Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-semibold tracking-wider uppercase border px-1.5 py-0.5 rounded-lg leading-none ${getCategoryColorClass(habit.category)}`}>
                            {habit.category}
                          </span>
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 border rounded-lg leading-none ${getDifficultyColorClass(habit.difficulty)}`}>
                            {habit.difficulty}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold dark:text-slate-100 text-slate-800 mt-1">
                          {habit.name}
                        </h4>
                      </div>
                    </div>

                    {/* Highly tactile streak badge */}
                    <div className="flex items-center gap-1 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 py-1 px-2.5 rounded-xl">
                      <Flame className={`w-3.5 h-3.5 text-orange-400 ${isStreakActive ? 'active-streak-flame' : 'opacity-40'}`} />
                      <span className="text-xs font-extrabold font-mono text-slate-800 dark:text-white leading-none">
                        {currentFormattedStreak}d
                      </span>
                    </div>
                  </div>

                  {habit.description && (
                    <p className="text-[11px] dark:text-slate-400 text-slate-600 leading-normal mb-4">
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Tracking interaction past 7 days: Heavy support for touch styling */}
                <div className="mt-auto pt-2 border-t border-slate-200 dark:border-white/5 space-y-4">
                  
                  {/* Past 7 days bubble list optimized for Tap Operations on mobile (iPhone 14/17 optimized touch sizing) */}
                  <div>
                    <span className="block text-[9px] uppercase font-bold tracking-wider dark:text-slate-500 text-slate-600 mb-2">Past 7 days routine logs</span>
                    <div className="grid grid-cols-7 gap-1 bg-slate-200/50 dark:bg-slate-950/20 border border-slate-300 dark:border-white/5 p-1 rounded-xl">
                      {past7Days.map((dayStr) => {
                        const isDayComplete = habit.logs.includes(dayStr);
                        const isToday = dayStr === todayDateStr;
                        
                        // Extract weekday character
                        const d = new Date(dayStr.split('-').map(Number)[0], dayStr.split('-').map(Number)[1] - 1, dayStr.split('-').map(Number)[2]);
                        const labelShort = d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);

                        return (
                          <div 
                            key={dayStr} 
                            onClick={(e) => {
                              // Direct tapping of container trigger logs for extreme mobile simplicity!
                              e.preventDefault();
                              handleToggleLogDay(habit.id, dayStr);
                            }}
                            className={`flex flex-col items-center justify-between py-2 px-0.5 rounded-lg cursor-pointer transition-all active:scale-90 ${
                              isDayComplete 
                                ? 'bg-cyan-500/10 dark:bg-cyan-500/10 border border-cyan-500/30' 
                                : isToday 
                                  ? 'bg-slate-300/35 dark:bg-white/[0.04] border border-slate-350 dark:border-white/10' 
                                  : 'border border-transparent hover:bg-slate-300/20 dark:hover:bg-white/5'
                            }`}
                            title={`${formatFriendlyDate(dayStr)}`}
                          >
                            {/* Short Label */}
                            <span className={`text-[8px] font-bold leading-none mb-1.5 uppercase ${
                              isToday ? 'dark:text-cyan-400 text-cyan-600' : 'dark:text-slate-500 text-slate-600'
                            }`}>
                              {labelShort}
                            </span>
                            
                            {/* Tactile Large Checkbox */}
                            <div className="relative pointer-events-none flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isDayComplete}
                                readOnly
                                className="bouncy-checkbox"
                                id={`check-${habit.id}-${dayStr}`}
                              />
                              <svg className="checkmark-svg w-3.5 h-3.5 pointer-events-none absolute" viewBox="0 0 24 24">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Actions / Details Strip */}
                  <div className="flex items-center justify-between gap-2 text-[10px] dark:text-slate-500 text-slate-600 font-mono">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="flex items-center gap-1 opacity-80">
                        <TrendingUp className="w-3 h-3 dark:text-cyan-400 text-cyan-600" /> Max streak: {habit.longestStreak} days
                      </span>
                      <label className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-200/50 dark:bg-slate-950/30 border border-slate-300 dark:border-white/5">
                        <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        <input
                          type="number"
                          min={1}
                          max={240}
                          value={getHabitTargetMinutes(habit)}
                          onChange={(e) => handleUpdateTargetMinutes(habit.id, Number(e.target.value))}
                          className="w-10 bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                          aria-label={`Target minutes for ${habit.name}`}
                        />
                        <span>m</span>
                      </label>
                    </div>
                    {deletingHabitId === habit.id ? (
                      <div className="flex items-center gap-1.5 animate-entrance">
                        <span className="text-[9px] text-red-500 dark:text-red-400 font-bold uppercase tracking-wider mr-1">Delete?</span>
                        <button
                          onClick={() => {
                            handleDeleteHabit(habit.id);
                          }}
                          className="bg-red-500/10 dark:bg-red-500/20 hover:bg-red-600 border border-red-500/30 text-red-700 dark:text-red-200 hover:text-white px-2 py-0.5 rounded text-[9px] cursor-pointer transition-all font-sans font-semibold active:scale-95"
                          id={`confirm-delete-${habit.id}`}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingHabitId(null)}
                          className="bg-slate-205 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-all"
                          id={`cancel-delete-${habit.id}`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingHabitId(habit.id)}
                        className="text-slate-500 hover:text-red-550 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Remove Habit permanently"
                        id={`delete-btn-${habit.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- APPLE-STYLE LIQUID GLASS 30-DAY ACTIVITY MONITOR ----------------- */}
      <section className="liquid-glass p-4 sm:p-6 rounded-2xl mt-8 overflow-hidden select-none" id="usage-chart-section">
        
        {/* Top Header Row with dynamic time display and date swiper */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 block mb-1">Activity Duration</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black dark:text-white text-slate-800 tracking-tight">
                {selectedDayMinutesData.total > 0 ? formatMinutesFriendly(selectedDayMinutesData.total) : '0m'}
              </span>
              <span className="text-[10px] sm:text-[11px] dark:text-slate-500 text-slate-500 font-medium font-mono">
                {selectedUsageDateLabel}
              </span>
            </div>
          </div>

          {/* iOS Style Segment Date Controller */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-200/60 dark:bg-slate-950/40 p-1 sm:p-1.5 rounded-xl border border-slate-300 dark:border-white/5 w-full sm:w-auto justify-between shrink-0">
            <button
              type="button"
              disabled={selectedUsageOffset <= 0}
              onClick={() => setSelectedUsageOffset(prev => Math.max(prev - 1, 0))}
              className="p-1.5 rounded-lg bg-slate-300/30 dark:bg-white/[0.02] hover:bg-slate-350 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-90"
              title="Newer date"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-bold dark:text-slate-300 text-slate-800 px-3 min-w-[120px] text-center font-sans tracking-tight">
              {selectedUsageDateLabel}
            </span>
            <button
              type="button"
              disabled={selectedUsageOffset >= 29}
              onClick={() => setSelectedUsageOffset(prev => Math.min(prev + 1, 29))}
              className="p-1.5 rounded-lg bg-slate-300/30 dark:bg-white/[0.02] hover:bg-slate-350 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-90"
              title="Older date"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* The Graphic Bar Chart Area including realistic grid and Green Average line */}
        <div className="activity-duration-scroll no-scrollbar -mx-2 px-2 pb-2 mb-4" role="region" aria-label="Scrollable activity duration chart">
        <div className="activity-duration-canvas relative h-48 sm:h-44 mb-2 border-b border-slate-200 dark:border-white/10" id="activity-monitor-grid-container">
          
          {/* Horizontal Grid lines mirroring physical screenshot */}
          <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none text-[9px] dark:text-slate-500/55 text-slate-600/70 font-mono">
            <div className="border-b border-dashed border-slate-200 dark:border-white/[0.03] pt-1 flex justify-between">
              <span>{formatMinutesFriendly(chartHeightScaleMinutes)}</span>
              <span className="dark:text-slate-500 text-slate-600 mr-1">Limit</span>
            </div>
            <div className="border-b border-dashed border-slate-200 dark:border-white/[0.03] flex justify-between pb-1">
              <span>{formatMinutesFriendly(chartHeightScaleMinutes / 2)}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span>0m</span>
            </div>
          </div>

          {/* Dotted Green Average Line with label directly on the right margin */}
          {averageMinutes30Days > 0 && (
            <div 
              className="absolute left-0 right-0 border-t border-dashed border-emerald-500/80 z-10 flex justify-end transition-all duration-300"
              style={{ 
                bottom: `${Math.min((averageMinutes30Days / chartHeightScaleMinutes) * 100, 95)}%` 
              }}
            >
              <span className="bg-emerald-500/10 dark:bg-[#10b981] border border-emerald-500/20 text-emerald-800 dark:text-slate-950 font-black tracking-widest text-[8px] uppercase px-1 rounded-sm leading-none py-0.5 -mt-1.5 mr-1 shadow-sm">
                avg
              </span>
            </div>
          )}

          {/* Columns Display Grid */}
          <div className="absolute inset-0 pt-6 flex items-end justify-between px-3 sm:px-6">
            {completedMinutesByDayList.map((dayData) => {
              const heightPercent = Math.min((dayData.total / chartHeightScaleMinutes) * 100, 100);
              const isActiveDaySelected = dayData.dateStr === selectedUsageDateStr;

              // Stacked Heights calculations to represent category mixes inside the bars
              const totalMins = Math.max(dayData.total, 1);
              const workPct = (dayData.work / totalMins) * 100;
              const mindfulnessPct = (dayData.mindfulness / totalMins) * 100;
              const healthPct = (dayData.health / totalMins) * 100;
              const fitnessPct = (dayData.fitness / totalMins) * 100;
              const creativePct = (dayData.creative / totalMins) * 100;

              return (
                <div 
                  key={dayData.dateStr}
                  onClick={() => {
                    // Match select offset dynamically when clicking column bars! Extremely interactive!
                    const matchIndex = past30Days.indexOf(dayData.dateStr);
                    if (matchIndex !== -1) {
                      setSelectedUsageOffset(29 - matchIndex);
                    }
                  }}
                  className="flex flex-col items-center flex-1 max-w-[14px] sm:max-w-[28px] h-full justify-end cursor-pointer group"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-950 text-white text-[9px] px-2 py-1 rounded absolute -top-1 pointer-events-none z-20 font-mono text-center shadow-lg border border-slate-200 dark:border-white/5">
                    {formatMinutesFriendly(dayData.total)}
                  </div>

                  {/* Faint bar Track guide resembling Apple Screen Time */}
                  <div className={`w-1.5 sm:w-3 h-full rounded-full overflow-hidden relative transition-all duration-300 flex flex-col justify-end ${
                    isActiveDaySelected 
                      ? 'bg-slate-350 dark:bg-slate-800/80 ring-2 ring-cyan-500/40 shadow-sm' 
                      : 'bg-slate-205 dark:bg-slate-900/35 hover:bg-slate-300/80 dark:hover:bg-slate-900/60'
                  }`}>
                    
                    {/* Visual Filled stack sections colored cleanly */}
                    <div 
                      className="w-full transition-all duration-500 ease-out flex flex-col justify-end"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Producty Work stack (Blue) */}
                      {dayData.work > 0 && (
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400" 
                          style={{ height: `${workPct}%` }}
                        />
                      )}
                      
                      {/* Zen Mindfulness stack (Cyan-Emerald) */}
                      {dayData.mindfulness > 0 && (
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-500 to-teal-400" 
                          style={{ height: `${mindfulnessPct}%` }}
                        />
                      )}

                      {/* Fitness stack (Purple) */}
                      {dayData.fitness > 0 && (
                        <div 
                          className="w-full bg-gradient-to-t from-teal-600 to-cyan-400" 
                          style={{ height: `${fitnessPct}%` }}
                        />
                      )}

                      {/* Health / Nutrition stack (Vibrant Orange-Amber Gradient) */}
                      {dayData.health > 0 && (
                        <div 
                          className="w-full bg-gradient-to-t from-orange-500 to-amber-400" 
                          style={{ height: `${healthPct}%` }}
                        />
                      )}

                      {/* Creative stack (Pink) */}
                      {dayData.creative > 0 && (
                        <div 
                          className="w-full bg-gradient-to-t from-pink-500 to-pink-400" 
                          style={{ height: `${creativePct}%` }}
                        />
                      )}

                      {/* Base fallback tiny block if a logged routine has no minutes yet */}
                      {dayData.total === 0 && dayData.total > 0 && (
                        <div className="w-full h-1 bg-slate-400 dark:bg-slate-600" />
                      )}
                    </div>

                  </div>

                  {/* Column Label */}
                  <span className={`text-[8px] sm:text-[9.5px] font-bold mt-2 font-sans tracking-tight ${
                    isActiveDaySelected ? 'text-cyan-500 font-extrabold scale-110' : 'text-slate-500 dark:text-slate-550'
                  }`}>
                    {dayData.dayOfWeek}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
        </div>

        {/* Category durations and statistics labels panel (Mirroring the activity-monitor list legend) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-white/5" id="activity-monitor-legend-row">
          
          <div className="flex items-center gap-2.5 bg-slate-200/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-300 dark:border-white/5 shadow-sm">
            <span className="w-3 h-3 rounded bg-cyan-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold dark:text-slate-500 text-slate-650 tracking-wider block">Productivity & Work</span>
              <span className="text-sm font-black dark:text-white text-slate-805 block">
                {selectedDayMinutesData.work > 0 ? formatMinutesFriendly(selectedDayMinutesData.work) : '0m'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-200/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-300 dark:border-white/5 shadow-sm">
            <span className="w-3 h-3 rounded bg-emerald-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold dark:text-slate-500 text-slate-650 tracking-wider block">Zen & Mindfulness</span>
              <span className="text-sm font-black dark:text-white text-slate-805 block">
                {selectedDayMinutesData.mindfulness > 0 ? formatMinutesFriendly(selectedDayMinutesData.mindfulness) : '0m'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-200/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-300 dark:border-white/5 shadow-sm">
            <span className="w-3 h-3 rounded bg-orange-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold dark:text-slate-500 text-slate-650 tracking-wider block">Health & Lifestyle</span>
              <span className="text-sm font-black dark:text-white text-slate-805 block">
                {selectedDayMinutesData.health + selectedDayMinutesData.fitness + selectedDayMinutesData.creative > 0 
                  ? formatMinutesFriendly(selectedDayMinutesData.health + selectedDayMinutesData.fitness + selectedDayMinutesData.creative) 
                  : '0m'}
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* ----------------- CLEAN HUMAN SCALE FOOTER ----------------- */}
      <footer className="mt-12 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-500">
        <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
          <span className="text-cyan-400 flex items-center gap-1 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse inline-block status-dot-active" />
            Latency: {latency}ms
          </span>
          <span>Offline Storage Ready</span>
        </div>
        <div className="text-slate-600 uppercase tracking-widest font-semibold">
          {BRAND.name} • v2.0.0
        </div>
      </footer>
    </div>
  );
}
