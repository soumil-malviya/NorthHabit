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
  AlertCircle,
  ListPlus,
  Settings2,
  type LucideIcon,
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
import { DataPortabilityPanel } from '../components/DataPortabilityPanel';
import { useLatency } from '../hooks/useLatency';
import { MinuteDurationInput } from '../components/MinuteDurationInput';
import { useTodos } from '../hooks/useTodos';
import { useFocusEcosystem } from '../hooks/useFocusEcosystem';

type DashboardPanelProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

function DashboardPanel({ children, className = '', id }: DashboardPanelProps) {
  return (
    <section id={id} className={`dashboard-panel ${className}`}>
      {children}
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="dashboard-section-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="dashboard-metric-tile">
      <div className="dashboard-metric-icon">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { username, setUsername, maxStreak, theme, toggleTheme } =
    useOutletContext<AppOutletContext>();
  const location = useLocation();
  const network = useLatency();

  // ----------------------------------------------------
  // States
  // ----------------------------------------------------
  const { habits, setHabits } = useHabits();
  const { todos } = useTodos();
  const { stats: focusStats } = useFocusEcosystem();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsageOffset, setSelectedUsageOffset] = useState(0);
  
  // Mobile declutter expanders
  const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

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
  // ----------------------------------------------------
  // Interactive Actions
  // ----------------------------------------------------
  const handleAddNewHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      setFormError('Please provide a habit name.');
      return;
    }

    const minutes = Math.max(1, Math.round(newHabitTargetMinutes));

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
      return Math.max(1, Math.round(habit.targetMinutes));
    }
    return 10;
  };

  const handleUpdateTargetMinutes = (habitId: string, minutes: number) => {
    const next = Math.max(1, Math.round(minutes || 1));
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

  const todayTodos = useMemo(() => {
    return todos.filter((todo) => todo.scheduledDate === todayDateStr || todo.scheduledDate === null);
  }, [todos, todayDateStr]);

  const openTodoCount = useMemo(() => {
    return todos.filter((todo) => !todo.completed).length;
  }, [todos]);

  const previewTodos = useMemo(() => {
    return [...todayTodos]
      .filter((todo) => !todo.completed)
      .slice(0, 3);
  }, [todayTodos]);

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
    setIsHydrated(true);
  }, []);

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
    <div className="dashboard-shell">
      {!isHydrated ? (
        <div className="grid gap-3" aria-hidden>
          <div className="dashboard-skeleton h-28" />
          <div className="dashboard-skeleton h-44" />
          <div className="dashboard-skeleton h-64" />
        </div>
      ) : (
      <>
        <header className="dashboard-hero" id="tracker-header">
          <div className="dashboard-hero-copy">
            <span className="dashboard-eyebrow">Overview</span>
            <h1>Good to see you, {username || BRAND.defaultUsername}.</h1>
            <p>
              Track today’s routines, focus sessions, and open tasks from one overview.
            </p>
          </div>
          <div className="dashboard-hero-actions">
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
              className={`dashboard-icon-button ${isSettingsOpen ? 'is-active' : ''}`}
              title="Backup settings"
              id="settings-toggle-btn"
              aria-label="Open dashboard settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </header>

      {/* ----------------- COLLAPSIBLE SETTINGS & BACKUP DRAWER ----------------- */}
      {isSettingsOpen && (
        <div className="dashboard-panel dashboard-settings-panel animate-entrance" id="settings-drawer">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">Settings & Personalization</h4>
            <span className="text-[9px] dark:text-slate-450 text-slate-500 font-mono">Status: LocalStorage Connected</span>
          </div>
          <p className="text-xs dark:text-slate-400 text-slate-600 mb-4 leading-relaxed">
            Configure your display preference or move your full workspace between devices. All your data resides locally on your client device.
          </p>

          <div className="mb-4">
            <DataPortabilityPanel />
          </div>

          <AmbientSettingsPanel theme={theme} />
        </div>
      )}

      <section className="dashboard-overview-grid" aria-label="Dashboard overview">
        <DashboardPanel className="dashboard-primary-panel" id="tracker-stats-grid">
          <SectionHeader
            eyebrow="Habits summary"
            title={`${todayCompletionRate}% complete today`}
            description={`${todayCompletedCount} of ${totalActiveHabitsCount} routines checked in. ${pendingTodayCount === 0 ? 'Today is clear.' : `${pendingTodayCount} still open.`}`}
          />
          <div className="dashboard-completion-track" aria-label={`Today ${todayCompletionRate}% complete`}>
            <span style={{ width: `${todayCompletionRate}%` }} />
          </div>
          <div className="dashboard-metric-grid">
            <MetricTile label="Today" value={`${todayCompletedCount}/${totalActiveHabitsCount}`} detail="Routine completion" icon={Check} />
            <MetricTile label="Consistency" value={`${consistencyIndex}%`} detail="Past 30 days" icon={TrendingUp} />
            <MetricTile label="Focus" value={formatMinutesFriendly(focusStats.weekMinutes)} detail="This week" icon={Timer} />
          </div>
        </DashboardPanel>

        <DashboardPanel className="dashboard-streak-panel">
          <SectionHeader
            eyebrow="Streak analytics"
            title={`${maxActiveStreak} day streak`}
            description={topStreakHabit ? `${topStreakHabit.name} has your longest active streak.` : 'Add a routine to begin a streak.'}
          />
          <div className="dashboard-streak-rail" aria-hidden>
            {Array.from({ length: 10 }).map((_, index) => (
              <span
                key={index}
                className={index < Math.min(maxActiveStreak, 10) ? 'is-active' : ''}
              />
            ))}
          </div>
          <div className="dashboard-small-stat-row">
            <span>Best today</span>
            <strong>{maxActiveStreak}d</strong>
          </div>
        </DashboardPanel>

        <DashboardPanel className="dashboard-quick-panel" id="dashboard-shortcuts">
          <SectionHeader
            eyebrow="Quick actions"
            title={pendingTodayCount === 0 ? 'All clear today' : `${pendingTodayCount} habits left`}
            description="Jump into the most common next moves without leaving the dashboard."
          />
          <div className="dashboard-action-grid">
            <Link to="/app/pomodoro?action=start" className="dashboard-shortcut-card">
              <Timer className="w-4 h-4" />
              <span>Start focus</span>
            </Link>
            <Link to="/app?view=today" className="dashboard-shortcut-card">
              <Check className="w-4 h-4" />
              <span>Today</span>
            </Link>
            <Link to="/app/todo?action=add" className="dashboard-shortcut-card">
              <ListPlus className="w-4 h-4" />
              <span>Add task</span>
            </Link>
            <Link to="/app/calendar" className="dashboard-shortcut-card">
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </Link>
          </div>
        </DashboardPanel>

        <DashboardPanel className="dashboard-preview-panel">
          <SectionHeader
            eyebrow="Tasks & calendar"
            title={`${openTodoCount} open tasks`}
            description={previewTodos.length > 0 ? 'Next visible tasks for today.' : 'Your task list is quiet right now.'}
          />
          <div className="dashboard-preview-list">
            {previewTodos.length > 0 ? (
              previewTodos.map((todo) => (
                <Link key={todo.id} to="/app/todo" className="dashboard-preview-item">
                  <span>{todo.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ))
            ) : (
              <Link to="/app/todo?action=add" className="dashboard-preview-item">
                <span>Capture a task for today</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </DashboardPanel>
      </section>

      {/* ----------------- FILTER SHEETS & ACTIONS ----------------- */}
      <DashboardPanel className="dashboard-routines-panel" id="habits-section">
      <SectionHeader
        eyebrow="Routine workspace"
        title="Today’s habit surface"
        description="Filter, add, and check in routines without leaving the main flow."
      />
      <div className="dashboard-control-stack" id="filters-container">
        
        {/* Swipable scroll container for category filters on Mobile */}
        <div className="relative min-w-0 max-w-full">
          <div className="dashboard-filter-scroll flex items-center gap-1.5 scroll-smooth py-1" id="category-filter-bar">
            {(
              [
                ['all', 'All', null],
                ['health', 'Health', Heart],
                ['fitness', 'Fitness', Activity],
                ['mindfulness', 'Mindfulness', Sparkles],
                ['work', 'Work', Briefcase],
                ['creative', 'Creative', Palette],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategoryFilter(key)}
                className={`dashboard-chip dashboard-chip--category flex items-center gap-1 ${
                  activeCategoryFilter === key ? 'is-active' : ''
                }`}
              >
                {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                {label}
              </button>
            ))}
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
              className="dashboard-input"
              id="search-input"
            />
          </div>

          <div className="flex gap-2">
            {/* Today Complete Filter Toggle Bar */}
            <div className="dashboard-segment flex-1 sm:flex-initial font-sans text-xs" id="completion-filter-pills">
              {(['all', 'completed', 'pending'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setCompletionFilter(filter)}
                  className={completionFilter === filter ? 'is-active' : ''}
                  id={`complete-filter-${filter === 'all' ? 'all' : filter === 'completed' ? 'done' : 'pending'}`}
                >
                  {filter === 'all' ? 'All' : filter === 'completed' ? 'Done' : 'Pending'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddingHabit(prev => !prev)}
              className="dashboard-btn-primary"
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
          className="dashboard-form-panel mb-6 animate-entrance"
          id="add-habit-form"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border-light)]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accent-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Add a new routine
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
              <div className="flex items-center justify-between gap-2 bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-3 rounded-xl">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <MinuteDurationInput
                  value={newHabitTargetMinutes}
                  onChange={setNewHabitTargetMinutes}
                  label="Time required"
                />
              </div>
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
        <div className="dashboard-empty-state flex flex-col items-center justify-center max-w-md mx-auto" id="empty-state-notice">
          <div className="p-3 rounded-lg mb-3 text-[var(--accent-primary)] bg-[color-mix(in_srgb,var(--accent-primary)_10%,var(--surface-muted))] border border-[color-mix(in_srgb,var(--accent-primary)_20%,var(--border-light))]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">No routines found</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
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
              className="mt-4 dashboard-chip"
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
                className={`dashboard-habit-card flex flex-col justify-between overflow-hidden relative duration-350 ${getCategoryThemeClass(habit.category)}`}
                style={{ contentVisibility: 'auto' }}
                id={`habit-card-${habit.id}`}
              >
                {/* Card Title Metadata */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3 min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-xl flex items-center justify-center">
                        {getCategoryIcon(habit.category)}
                      </div>
                      <div className="min-w-0">
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
                    <div className="dashboard-streak-badge">
                      <Flame className={`w-3.5 h-3.5 text-[var(--state-warning)] ${isStreakActive ? 'active-streak-flame' : 'opacity-40'}`} />
                      <span className="leading-none">
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
                    <div className="habit-week-grid bg-slate-200/50 dark:bg-slate-950/20 border border-slate-300 dark:border-white/5 rounded-xl">
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
                            className={`habit-week-cell flex flex-col items-center justify-between py-2 px-0.5 rounded-lg cursor-pointer transition-all active:scale-90 ${
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
                  <div className="habit-card-footer text-[10px] dark:text-slate-500 text-slate-600 font-mono">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="flex items-center gap-1 opacity-80">
                        <TrendingUp className="w-3 h-3 dark:text-cyan-400 text-cyan-600" /> Max streak: {habit.longestStreak} days
                      </span>
                      <div className="habit-time-control">
                        <Clock className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        <MinuteDurationInput
                          value={getHabitTargetMinutes(habit)}
                          onChange={(minutes) => handleUpdateTargetMinutes(habit.id, minutes)}
                          label={`Target minutes for ${habit.name}`}
                        />
                      </div>
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
      </DashboardPanel>

      {/* ----------------- APPLE-STYLE LIQUID GLASS 30-DAY ACTIVITY MONITOR ----------------- */}
      <DashboardPanel className="dashboard-insights-panel select-none" id="usage-chart-section">
        <SectionHeader
          eyebrow="Productivity insights"
          title="Activity duration"
          description="Review completed routine time by day and category."
        />
        
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

      </DashboardPanel>

      {/* ----------------- CLEAN HUMAN SCALE FOOTER ----------------- */}
      <footer className="mt-12 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-500">
        <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
          <span
            className={`flex items-center gap-1 font-bold tracking-wider transition-colors ${
              network.status === 'offline'
                ? 'text-rose-500'
                : network.status === 'slow'
                  ? 'text-amber-500'
                  : 'text-cyan-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full inline-block status-dot-active ${
              network.status === 'offline'
                ? 'bg-rose-500'
                : network.status === 'slow'
                  ? 'bg-amber-500'
                  : 'bg-cyan-500 animate-pulse'
            }`} />
            Network: {network.label}
          </span>
          <span>Offline Storage Ready</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600 uppercase tracking-widest font-semibold">
          <span>{BRAND.name} • v2.0.0</span>
          <Link className="hover:text-cyan-500 transition-colors" to="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-cyan-500 transition-colors" to="/terms">
            Terms
          </Link>
        </div>
      </footer>
      </>
      )}
    </div>
  );
}
