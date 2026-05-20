import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowUpRight, 
  Download, 
  Upload,
  AlertCircle,
  BookOpen,
  Feather,
  Sun,
  Moon,
  Edit2
} from 'lucide-react';
import { CategoryType, FrequencyType, DifficultyType, Habit } from './types';
import { 
  getLocalDateString, 
  formatFriendlyDate, 
  getPastDates, 
  calculateStreak 
} from './utils';

// Predefined mock/default habits to give a premium immediate playground experience
const DEFAULT_HABITS = (): Habit[] => {
  const today = getLocalDateString(0);
  const yester = getLocalDateString(-1);
  const back2 = getLocalDateString(-2);
  const back3 = getLocalDateString(-3);
  const back4 = getLocalDateString(-4);
  const back5 = getLocalDateString(-5);
  const back7 = getLocalDateString(-7);

  return [
    {
      id: 'default-1',
      name: 'Mindful Meditation',
      description: '10-minute deep breathing and thoughts observation to start the day calm.',
      category: 'mindfulness',
      frequency: 'daily',
      difficulty: 'easy',
      createdAt: getLocalDateString(-15),
      logs: [today, yester, back2, back3, back5, back7], // 4-day streak active today!
    },
    {
      id: 'default-2',
      name: 'Cardio Training',
      description: '30-minute high-intensity cardio workout or endurance run.',
      category: 'fitness',
      frequency: 'daily',
      difficulty: 'medium',
      createdAt: getLocalDateString(-15),
      logs: [yester, back2, back3, back4], // 4-day streak active starting yesterday
    },
    {
      id: 'default-3',
      name: 'Green Tea & Hydration',
      description: 'Drink at least 3L of water and clear antioxidants first thing.',
      category: 'health',
      frequency: 'daily',
      difficulty: 'easy',
      createdAt: getLocalDateString(-15),
      logs: [today, yester], // 2-day streak active today!
    },
    {
      id: 'default-4',
      name: 'Review Daily Code Commit',
      description: 'Submit polished commits and check self-hosted server containers.',
      category: 'work',
      frequency: 'daily',
      difficulty: 'hard',
      createdAt: getLocalDateString(-15),
      logs: [today, yester, back2, back4], // 3-day active streak!
    }
  ];
};

export default function App() {
  // ----------------------------------------------------
  // States
  // ----------------------------------------------------
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const stored = localStorage.getItem('personal_habits');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading habits storage', e);
    }
    return DEFAULT_HABITS();
  });

  // Username personalization states (defaults to 'subject')
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('routine_username') || 'subject';
  });
  const [tempUsername, setTempUsername] = useState<string>(username);
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsageOffset, setSelectedUsageOffset] = useState(0);
  
  // Theme state - supporting dark and light themes (loaded from local storage)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('routine_theme') as 'dark' | 'light') || 'dark';
  });

  // Mobile declutter expanders
  const [isHeatmapExpanded, setIsHeatmapExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [latency, setLatency] = useState(14);

  // Custom interactive date time for server view
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form fields state
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<CategoryType>('health');
  const [newHabitFrequency, setNewHabitFrequency] = useState<FrequencyType>('daily');
  const [newHabitDifficulty, setNewHabitDifficulty] = useState<DifficultyType>('easy');
  const [formError, setFormError] = useState('');

  // Past 7 Days List (oldest on left, today on right)
  const past7Days = useMemo(() => getPastDates(7), []);
  // Past 30 Days List (oldest on left, today on right)
  const past30Days = useMemo(() => getPastDates(30), []);
  const todayDateStr = useMemo(() => getLocalDateString(0), []);

  // ----------------------------------------------------
  // Effects
  // ----------------------------------------------------
  // Sync light-theme class with document body and localStorage
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark');
      localStorage.setItem('routine_theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark');
      localStorage.setItem('routine_theme', 'dark');
    }
  }, [theme]);

  // Keep local clock synced
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Save changes to localStorage automatically
  useEffect(() => {
    localStorage.setItem('personal_habits', JSON.stringify(habits));
  }, [habits]);

  // Save username to localStorage automatically
  useEffect(() => {
    localStorage.setItem('routine_username', username);
  }, [username]);

  // ----------------------------------------------------
  // Interactive Actions
  // ----------------------------------------------------
  const handleAddNewHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      setFormError('Please provide a habit name.');
      return;
    }

    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newHabitName.trim(),
      description: newHabitDesc.trim(),
      category: newHabitCategory,
      frequency: newHabitFrequency,
      difficulty: newHabitDifficulty,
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
        if (h.difficulty === 'easy') mins += 10;
        else if (h.difficulty === 'medium') mins += 20;
        else if (h.difficulty === 'hard') mins += 45;
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
          const weight = h.difficulty === 'easy' ? 10 : h.difficulty === 'medium' ? 20 : 45;
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
        const weight = h.difficulty === 'easy' ? 10 : h.difficulty === 'medium' ? 20 : 45;
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

  // Rendering styling constants
  const getCategoryColorClass = (category: CategoryType) => {
    switch(category) {
      case 'health': return 'dark:text-orange-400 text-orange-650 dark:bg-orange-500/10 bg-orange-500/15 border-orange-500/25';
      case 'fitness': return 'dark:text-violet-400 text-violet-650 dark:bg-violet-500/10 bg-violet-500/15 border-violet-500/25';
      case 'mindfulness': return 'dark:text-emerald-400 text-emerald-650 dark:bg-emerald-500/10 bg-emerald-500/15 border-emerald-500/25';
      case 'work': return 'dark:text-blue-400 text-blue-650 dark:bg-blue-500/10 bg-blue-500/15 border-blue-500/25';
      case 'creative': return 'dark:text-pink-400 text-pink-650 dark:bg-pink-500/10 bg-pink-500/15 border-pink-500/25';
    }
  };

  const getDifficultyColorClass = (diff: DifficultyType) => {
    switch(diff) {
      case 'easy': return 'dark:text-sky-300 text-sky-600 border-sky-400/20 dark:bg-sky-400/5 bg-sky-400/10';
      case 'medium': return 'dark:text-amber-300 text-amber-600 border-amber-400/20 dark:bg-amber-400/5 bg-amber-450/10';
      case 'hard': return 'dark:text-rose-400 text-rose-600 border-rose-400/20 dark:bg-rose-400/5 bg-rose-400/10';
    }
  };

  const getCategoryThemeClass = (category: CategoryType) => {
    switch(category) {
      case 'health': return 'bg-gradient-category-health';
      case 'fitness': return 'bg-gradient-category-fitness';
      case 'mindfulness': return 'bg-gradient-category-mindfulness';
      case 'work': return 'bg-gradient-category-work';
      case 'creative': return 'bg-gradient-category-creative';
    }
  };

  const getCategoryIcon = (category: CategoryType) => {
    switch(category) {
      case 'health': return <Heart className="w-5 h-5 dark:text-orange-400 text-orange-605" id={`cat-icon-${category}`} />;
      case 'fitness': return <Activity className="w-5 h-5 dark:text-violet-400 text-violet-605" id={`cat-icon-${category}`} />;
      case 'mindfulness': return <Sparkles className="w-5 h-5 dark:text-emerald-400 text-emerald-605" id={`cat-icon-${category}`} />;
      case 'work': return <Briefcase className="w-5 h-5 dark:text-blue-400 text-blue-605" id={`cat-icon-${category}`} />;
      case 'creative': return <Palette className="w-5 h-5 dark:text-pink-400 text-pink-605" id={`cat-icon-${category}`} />;
    }
  };

  return (
    <div className={`min-h-screen w-full transition-all duration-500 overflow-x-hidden ${theme === 'dark' ? 'bg-[#040405] text-[#f8fafc]' : 'bg-[#eef1f6] text-[#0f172a]'}`}>
      
      {/* Dynamic ambient blur flares */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none select-none -z-10 opacity-30">
        <div className={`absolute -top-[40%] left-[10%] w-[500px] h-[500px] rounded-full blur-[130px] transition-all duration-700 ${theme === 'dark' ? 'bg-indigo-600/15' : 'bg-indigo-300/10'}`} />
        <div className={`absolute -top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[130px] transition-all duration-700 ${theme === 'dark' ? 'bg-blue-600/15' : 'bg-blue-300/10'}`} />
      </div>

      <div className="pb-20 relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-blue-500/30">
        
        {/* ----------------- TOP NAVBAR / BRANDED HEADER ----------------- */}
        <header className="pt-6 pb-5 flex flex-col md:flex-row items-baseline md:items-center justify-between border-b border-white/5 mb-6 gap-4" id="tracker-header">
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/15 shrink-0 select-none">
                <BookOpen className="w-5.5 h-5.5 text-white" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center">
                  <Feather className="w-3.5 h-3.5 text-blue-300" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-1.5 dark:text-white text-slate-850">
                  Habit Tracker
                </h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">Simple Offline Habit Routine Tracker</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Backup & JSON Settings trigger button */}
              <button
                onClick={() => setIsSettingsOpen(prev => !prev)}
                className={`p-2.5 rounded-xl border transition-all active:scale-95 duration-200 cursor-pointer ${
                  isSettingsOpen 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                    : 'bg-white/[0.02] border border-slate-300 dark:border-white/5 text-slate-400 dark:hover:text-white hover:text-slate-800 dark:hover:bg-white/[0.05] hover:bg-slate-300/30'
                }`}
                title="Backup and database settings"
                id="settings-toggle-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              {/* Premium Theme Toggle button */}
              <button
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl border transition-all active:scale-95 duration-200 cursor-pointer bg-white/[0.02] border border-slate-300 dark:border-white/5 text-slate-400 dark:hover:text-white hover:text-slate-800 dark:hover:bg-white/[0.05] hover:bg-slate-300/30 flex items-center justify-center shrink-0"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                id="theme-toggle-btn"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
              
              {/* Minimal streak / profile info */}
              <div className="flex items-center gap-1.5 bg-slate-900/5 dark:bg-white/[0.02] border border-slate-900/10 dark:border-white/5 py-1.5 px-3 rounded-xl transition-all duration-300 hover:border-slate-800 dark:hover:border-white/10">
                {isEditingUsername ? (
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    onBlur={() => {
                      const trimmed = tempUsername.trim();
                      const nextVal = trimmed || 'subject';
                      setUsername(nextVal);
                      setTempUsername(nextVal);
                      setIsEditingUsername(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = tempUsername.trim();
                        const nextVal = trimmed || 'subject';
                        setUsername(nextVal);
                        setTempUsername(nextVal);
                        setIsEditingUsername(false);
                      } else if (e.key === 'Escape') {
                        setTempUsername(username);
                        setIsEditingUsername(false);
                      }
                    }}
                    autoFocus
                    maxLength={18}
                    className="bg-slate-900/50 dark:bg-slate-950/60 text-[11px] font-semibold text-slate-800 dark:text-slate-200 border border-blue-500/50 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-20 text-center font-sans"
                    id="username-inline-input"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setTempUsername(username);
                      setIsEditingUsername(true);
                    }}
                    className="group flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer outline-none rounded focus-visible:ring-1 focus-visible:ring-blue-500 select-none"
                    title="Click to change name"
                    aria-label={`Change name from ${username}`}
                    id="username-display-btn"
                  >
                    <span className="truncate max-w-[90px]">{username}</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 dark:text-slate-400 text-slate-500 group-hover:animate-pulse transition-opacity duration-200 shrink-0" />
                  </button>
                )}
                <div className="hidden sm:block h-3 w-[1px] bg-slate-900/10 dark:bg-white/10 mx-1" />
                <div className="flex items-center gap-0.5 text-orange-400 font-bold text-[10px] font-mono select-none">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  <span>{maxActiveStreak}D</span>
                </div>
              </div>
            </div>
          </div>
        </header>

      {/* ----------------- COLLAPSIBLE SETTINGS & BACKUP DRAWER ----------------- */}
      {isSettingsOpen && (
        <div className="glass-panel p-4 rounded-xl mb-6 border-blue-500/20 shadow-xl animate-entrance" id="settings-drawer">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Settings & Personalization</h4>
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
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
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

      {/* ----------------- FILTER SHEETS & ACTIONS ----------------- */}
      <div className="space-y-4 mb-6" id="filters-container">
        
        {/* Swipable scroll container for category filters on Mobile */}
        <div className="relative">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-2 px-2" id="category-filter-bar">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                activeCategoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 border-blue-600'
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
              className="bg-slate-200/60 dark:bg-slate-900/40 text-xs w-full text-slate-800 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 border border-slate-300 dark:border-white/5 py-2.5 px-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1 shadow-lg shadow-blue-500/15 cursor-pointer"
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
          className="glass-panel p-5 rounded-xl mb-6 border-blue-500/20 shadow-xl animate-entrance"
          id="add-habit-form"
        >
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
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
                  className="w-full bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-2.5 rounded-xl text-xs text-slate-850 dark:text-white cursor-pointer focus:border-blue-500"
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
                  className="w-full bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 py-2 px-2.5 rounded-xl text-xs text-slate-850 dark:text-white cursor-pointer focus:border-blue-500"
                  id="form-habit-frequency"
                >
                  <option value="daily" className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white">daily</option>
                  <option value="weekly" className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white">weekly</option>
                </select>
              </div>
            </div>

            {/* Intensity levels selector */}
            <div>
              <label className="block text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Routine Difficulty</label>
              <div className="grid grid-cols-3 gap-2" id="form-habit-difficulty-radios">
                {(['easy', 'medium', 'hard'] as DifficultyType[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setNewHabitDifficulty(diff)}
                    className={`py-2 border capitalize text-[11px] font-semibold rounded-xl transition-all ${
                      newHabitDifficulty === diff
                        ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl active:scale-95 transition-all text-center"
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
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-3 text-blue-400 animate-pulse">
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
                                ? 'bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30' 
                                : isToday 
                                  ? 'bg-slate-300/35 dark:bg-white/[0.04] border border-slate-350 dark:border-white/10' 
                                  : 'border border-transparent hover:bg-slate-300/20 dark:hover:bg-white/5'
                            }`}
                            title={`${formatFriendlyDate(dayStr)}`}
                          >
                            {/* Short Label */}
                            <span className={`text-[8px] font-bold leading-none mb-1.5 uppercase ${
                              isToday ? 'dark:text-blue-400 text-blue-600' : 'dark:text-slate-500 text-slate-600'
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
                  <div className="flex items-center justify-between text-[10px] dark:text-slate-500 text-slate-600 font-mono">
                    <span className="flex items-center gap-1 opacity-80">
                      <TrendingUp className="w-3 h-3 dark:text-cyan-400 text-cyan-600" /> Max streak: {habit.longestStreak} days
                    </span>
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
      <section className="liquid-glass p-6 rounded-2xl mt-8 overflow-hidden select-none" id="usage-chart-section">
        
        {/* Top Header Row with dynamic time display and date swiper */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 block mb-1">Activity Duration</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black dark:text-white text-slate-800 tracking-tight">
                {selectedDayMinutesData.total > 0 ? formatMinutesFriendly(selectedDayMinutesData.total) : '0m'}
              </span>
              <span className="text-[11px] dark:text-slate-500 text-slate-500 font-medium font-mono">
                {selectedUsageDateLabel}
              </span>
            </div>
          </div>

          {/* iOS Style Segment Date Controller */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-950/40 p-1.5 rounded-xl border border-slate-300 dark:border-white/5 w-full sm:w-auto justify-between">
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
        <div className="relative h-44 mb-6 border-b border-slate-200 dark:border-white/10" id="activity-monitor-grid-container">
          
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
          <div className="absolute inset-0 pt-6 flex items-end justify-between px-2 sm:px-6">
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
                      ? 'bg-slate-350 dark:bg-slate-800/80 ring-2 ring-blue-500/40 shadow-sm' 
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
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400" 
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
                          className="w-full bg-gradient-to-t from-violet-600 to-indigo-400" 
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

                      {/* Base fallback tiny block if log checked without difficulty calculation yet */}
                      {dayData.total === 0 && dayData.total > 0 && (
                        <div className="w-full h-1 bg-slate-400 dark:bg-slate-600" />
                      )}
                    </div>

                  </div>

                  {/* Column Label */}
                  <span className={`text-[8px] sm:text-[9.5px] font-bold mt-2 font-sans tracking-tight ${
                    isActiveDaySelected ? 'text-blue-500 font-extrabold scale-110' : 'text-slate-500 dark:text-slate-550'
                  }`}>
                    {dayData.dayOfWeek}
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Category durations and statistics labels panel (Mirroring the activity-monitor list legend) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-white/5" id="activity-monitor-legend-row">
          
          <div className="flex items-center gap-2.5 bg-slate-200/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-300 dark:border-white/5 shadow-sm">
            <span className="w-3 h-3 rounded bg-blue-500 flex-shrink-0" />
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
          <span className="text-blue-400 flex items-center gap-1 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse inline-block status-dot-active" />
            Latency: {latency}ms
          </span>
          <span>Offline Storage Ready</span>
        </div>
        <div className="text-slate-600 uppercase tracking-widest font-semibold">
          Habit Tracker • v1.1.0
        </div>
      </footer>

      </div>
    </div>
  );
}
