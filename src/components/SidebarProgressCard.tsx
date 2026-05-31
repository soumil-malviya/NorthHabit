import { motion, useReducedMotion } from 'motion/react';
import { Activity, Flame, TrendingUp, type LucideIcon } from 'lucide-react';
import { useMemo, type CSSProperties } from 'react';
import type { Habit } from '../types';
import { calculateStreak, getPastDates, getLocalDateString } from '../utils';

interface SidebarProgressCardProps {
  habits: Habit[];
  compact?: boolean;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getStreakGoal(streak: number) {
  if (streak < 7) return 7;
  if (streak < 14) return 14;
  if (streak < 30) return 30;
  if (streak < 60) return 60;
  return 100;
}

function getSidebarProgress(habits: Habit[]) {
  const today = getLocalDateString(0);
  const week = getPastDates(7);
  const total = habits.length;
  const completedToday = habits.filter((habit) => habit.logs.includes(today)).length;
  const dailyCompletion = total === 0 ? 0 : clampPercent((completedToday / total) * 100);
  const weekLogs = habits.reduce(
    (sum, habit) => sum + week.filter((date) => habit.logs.includes(date)).length,
    0,
  );
  const weeklyConsistency = total === 0 ? 0 : clampPercent((weekLogs / (total * week.length)) * 100);
  const currentStreak = total === 0 ? 0 : Math.max(...habits.map((habit) => calculateStreak(habit.logs).currentStreak));
  const streakGoal = getStreakGoal(currentStreak);
  const streakProgress = clampPercent((currentStreak / streakGoal) * 100);

  return {
    completedToday,
    dailyCompletion,
    weeklyConsistency,
    currentStreak,
    streakGoal,
    streakProgress,
  };
}

function SegmentedProgress({
  value,
  label,
  segments = 8,
}: {
  value: number;
  label: string;
  segments?: number;
}) {
  const reducedMotion = useReducedMotion();
  const active = Math.round((value / 100) * segments);

  return (
    <div className="sidebar-progress-segments" aria-label={`${label}: ${value}%`}>
      {Array.from({ length: segments }).map((_, index) => (
        <motion.span
          key={index}
          className={index < active ? 'is-active' : ''}
          initial={reducedMotion ? false : { scaleX: 0.35, opacity: 0.45 }}
          animate={{ scaleX: 1, opacity: index < active ? 1 : 0.55 }}
          transition={{
            duration: 0.42,
            delay: reducedMotion ? 0 : index * 0.035,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="sidebar-progress-metric">
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[var(--sidebar-progress-accent)]" strokeWidth={1.9} />
          <span className="truncate">{label}</span>
        </span>
        <span className="font-semibold text-[var(--text-primary)]">{value}</span>
      </div>
      <SegmentedProgress value={progress} label={label} />
    </div>
  );
}

export function SidebarProgressCard({ habits, compact = false }: SidebarProgressCardProps) {
  const stats = useMemo(() => getSidebarProgress(habits), [habits]);
  const reducedMotion = useReducedMotion();
  const accentAlpha = 0.1 + stats.dailyCompletion / 1000;

  return (
    <motion.section
      className={`sidebar-progress-card ${compact ? 'sidebar-progress-card--compact' : ''}`}
      style={{ '--progress-glow-alpha': accentAlpha } as CSSProperties}
      aria-label="Progress summary"
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reducedMotion ? undefined : { y: -1 }}
    >
      <div
        className="sidebar-progress-ring"
        role="progressbar"
        aria-label="Daily habit completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stats.dailyCompletion}
        style={{ '--progress': `${stats.dailyCompletion}%` } as CSSProperties}
      >
        <span>{stats.dailyCompletion}</span>
      </div>

      <div className="sidebar-progress-details">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Today
            </p>
            <h2 className="mt-0.5 text-sm font-extrabold tracking-tight text-[var(--text-primary)]">
              Progress pulse
            </h2>
          </div>
          <span className="rounded-full bg-[var(--sidebar-progress-chip)] px-2 py-1 text-[10px] font-bold text-[var(--sidebar-progress-accent)]">
            {stats.completedToday}/{habits.length || 0}
          </span>
        </div>

        <div className="space-y-3">
          <MetricRow icon={Activity} label="Daily habits" value={`${stats.dailyCompletion}%`} progress={stats.dailyCompletion} />
          <MetricRow icon={Flame} label="Streak" value={`${stats.currentStreak}/${stats.streakGoal}d`} progress={stats.streakProgress} />
          <MetricRow icon={TrendingUp} label="Weekly rhythm" value={`${stats.weeklyConsistency}%`} progress={stats.weeklyConsistency} />
        </div>
      </div>
    </motion.section>
  );
}
