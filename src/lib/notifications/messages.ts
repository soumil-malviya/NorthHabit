import type { NotificationPayload } from '../../types';

export function morningCheckInPayload(): NotificationPayload {
  return {
    title: 'A calm morning',
    body: 'Take a breath, then visit your habits when it feels right.',
    tag: 'habit-daily',
    url: '/app',
  };
}

export function habitReminderPayload(pendingCount: number): NotificationPayload {
  if (pendingCount === 1) {
    return {
      title: 'A gentle nudge',
      body: 'One habit is waiting for you today — no rush, just when you are ready.',
      tag: `habit-daily`,
      url: '/app',
    };
  }
  return {
    title: 'Your rituals await',
    body: `${pendingCount} habits are still open today. Take them one at a time.`,
    tag: `habit-daily`,
    url: '/app',
  };
}

export function streakReminderPayload(streakDays: number): NotificationPayload {
  return {
    title: streakDays >= 7 ? 'Streak milestone' : 'Keep your streak going',
    body:
      streakDays >= 7
        ? `${streakDays} days of showing up. A few minutes tonight keeps the glow alive.`
        : `You are on a ${streakDays}-day streak. A quiet check-in before bed helps it grow.`,
    tag: 'streak-daily',
    url: '/app',
  };
}

export function pomodoroWorkCompletePayload(): NotificationPayload {
  return {
    title: 'Focus session complete',
    body: 'Well done. Step away, breathe, and let your forest grow.',
    tag: `pomodoro-work-${Date.now()}`,
    url: '/app/pomodoro',
  };
}

export function pomodoroBreakCompletePayload(): NotificationPayload {
  return {
    title: 'Break is over',
    body: 'Whenever you are ready, your next focus block is here.',
    tag: `pomodoro-break-${Date.now()}`,
    url: '/app/pomodoro',
  };
}
