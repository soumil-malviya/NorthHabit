import { StreakStats } from './types';

// Get local date string in YYYY-MM-DD format
export function getLocalDateString(offsetDays = 0): string {
  const date = new Date();
  if (offsetDays !== 0) {
    date.setDate(date.getDate() + offsetDays);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format raw YYYY-MM-DD to friendly human format e.g. "May 20" or "Today" or "Yesterday"
export function formatFriendlyDate(dateStr: string): string {
  const today = getLocalDateString(0);
  const yesterday = getLocalDateString(-1);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' });
}

// Generate past N days for interactive checking
export function getPastDates(count = 7): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    // Reverse order: oldest first or newest first?
    // Let's go newest first so Today and Yesterday are on the right/left visually
    dates.push(getLocalDateString(-i));
  }
  return dates.reverse(); // oldest left, today right
}

// Robust Streak Calculations
export function calculateStreak(logs: string[]): StreakStats {
  if (!logs || logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Normalize logs: deduplicate and sort ascending (oldest first)
  const sortedDates = Array.from(new Set(logs))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Convert date strings to start-of-day Timestamps in UTC for precise millisecond math
  const timestamps = sortedDates.map(dStr => {
    const [year, month, day] = dStr.split('-').map(Number);
    // Use Date.UTC to prevent any local-timezone shift discrepancies
    return Date.UTC(year, month - 1, day);
  });

  const oneDayMs = 24 * 60 * 60 * 1000;

  // 1. Calculate Longest Streak
  let longestStreak = 0;
  let currentStreakCounter = 0;
  let prevTimestamp: number | null = null;

  for (const ts of timestamps) {
    if (prevTimestamp === null) {
      currentStreakCounter = 1;
    } else {
      const diff = ts - prevTimestamp;
      if (diff === oneDayMs) {
        currentStreakCounter++;
      } else if (diff > oneDayMs) {
        // Gap found, restart count
        currentStreakCounter = 1;
      }
      // If diff === 0 (duplicate), do nothing
    }
    prevTimestamp = ts;
    if (currentStreakCounter > longestStreak) {
      longestStreak = currentStreakCounter;
    }
  }

  // 2. Calculate Current Streak
  const todayStr = getLocalDateString(0);
  const yesterdayStr = getLocalDateString(-1);

  const [tY, tM, tD] = todayStr.split('-').map(Number);
  const todayTs = Date.UTC(tY, tM - 1, tD);

  const [yY, yM, yD] = yesterdayStr.split('-').map(Number);
  const yesterdayTs = Date.UTC(yY, yM - 1, yD);

  const uniqueTsSet = new Set(timestamps);

  let currentStreak = 0;
  let checkTs = todayTs;

  // If today is completed, check backwards starting from today.
  // If today is not completed, check backwards starting from yesterday.
  if (uniqueTsSet.has(todayTs)) {
    while (uniqueTsSet.has(checkTs)) {
      currentStreak++;
      checkTs -= oneDayMs;
    }
  } else if (uniqueTsSet.has(yesterdayTs)) {
    checkTs = yesterdayTs;
    while (uniqueTsSet.has(checkTs)) {
      currentStreak++;
      checkTs -= oneDayMs;
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}
