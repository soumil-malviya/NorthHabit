import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Compass, LayoutDashboard, Moon, Sun, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../constants/brand';
import type { ThemeMode } from '../../types';
import { useHabits } from '../../hooks/useHabits';
import { getLocalDateString } from '../../utils';
import type { Habit } from '../../types';

interface OnboardingExperienceProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  { id: 'welcome', eyebrow: 'Welcome', title: `Meet ${BRAND.name}` },
  { id: 'features', eyebrow: 'Overview', title: 'One calm workspace' },
  { id: 'theme', eyebrow: 'Appearance', title: 'Choose your atmosphere' },
  { id: 'habit', eyebrow: 'First routine', title: 'Plant your first anchor' },
  { id: 'focus', eyebrow: 'Focus', title: 'Try a focus session' },
  { id: 'dashboard', eyebrow: 'Dashboard', title: 'Your command surface' },
] as const;

export function OnboardingExperience({
  theme,
  onThemeChange,
  currentStep,
  totalSteps,
  onStepChange,
  onComplete,
  onSkip,
}: OnboardingExperienceProps) {
  const { habits, setHabits } = useHabits();
  const [habitName, setHabitName] = useState('');

  const step = STEPS[currentStep];
  const isLast = currentStep >= totalSteps - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    onStepChange(currentStep + 1);
  };

  const handleCreateHabit = () => {
    const name = habitName.trim();
    if (!name) {
      handleNext();
      return;
    }

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name,
      description: '',
      category: 'health',
      frequency: 'daily',
      difficulty: 'easy',
      targetMinutes: 10,
      createdAt: getLocalDateString(0),
      logs: [],
    };

    setHabits((prev) => [newHabit, ...prev]);
    setHabitName('');
    handleNext();
  };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.99 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="onboarding-panel"
        >
          <div className="onboarding-progress" aria-hidden>
            {STEPS.map((item, index) => (
              <span
                key={item.id}
                className={
                  index < currentStep
                    ? 'is-complete'
                    : index === currentStep
                      ? 'is-current'
                      : ''
                }
              />
            ))}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="onboarding-eyebrow">{step.eyebrow}</p>
              <h2 id="onboarding-title" className="onboarding-title">
                {step.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1 rounded-md"
            >
              Skip
            </button>
          </div>

          {currentStep === 0 && (
            <p className="onboarding-copy">
              {BRAND.name} is a private, offline-first space for habits, tasks, focus, and reflection.
              Settle in — we will guide you through the essentials in a few quiet steps.
            </p>
          )}

          {currentStep === 1 && (
            <div className="grid gap-2">
              {[
                ['Habits & streaks', 'Track routines with gentle consistency metrics.'],
                ['Tasks & calendar', 'Capture open loops and see your week at a glance.'],
                ['Focus forest', 'Grow your grove with intentional Pomodoro sessions.'],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-muted)] px-3 py-2.5"
                >
                  <strong className="block text-sm text-[var(--text-primary)]">{title}</strong>
                  <span className="text-xs text-[var(--text-secondary)]">{body}</span>
                </div>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="onboarding-theme-grid">
              <button
                type="button"
                onClick={() => onThemeChange('light')}
                className={`onboarding-theme-option ${theme === 'light' ? 'is-selected' : ''}`}
              >
                <Sun className="w-4 h-4 mb-2 text-[var(--accent-primary)]" />
                <strong>Light</strong>
                <span>Bright, editorial workspace</span>
              </button>
              <button
                type="button"
                onClick={() => onThemeChange('dark')}
                className={`onboarding-theme-option ${theme === 'dark' ? 'is-selected' : ''}`}
              >
                <Moon className="w-4 h-4 mb-2 text-[var(--accent-primary)]" />
                <strong>Dark</strong>
                <span>Matte, distraction-free focus</span>
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid gap-3">
              <p className="onboarding-copy">
                Name one small routine you want to return to daily. You can refine it later on the dashboard.
              </p>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g. Morning walk, Read 10 pages"
                className="dashboard-input"
                autoFocus
              />
              {habits.length > 0 ? (
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[var(--state-success)]" />
                  {habits.length} routine{habits.length === 1 ? '' : 's'} already saved locally.
                </p>
              ) : null}
            </div>
          )}

          {currentStep === 4 && (
            <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-light)] flex items-center justify-center">
                  <Timer className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <strong className="block text-sm text-[var(--text-primary)]">25-minute sessions</strong>
                  <span className="text-xs text-[var(--text-secondary)]">Each completed session plants a tree.</span>
                </div>
              </div>
              <Link
                to="/app/pomodoro?action=start"
                onClick={onComplete}
                className="dashboard-btn-primary w-full"
              >
                Open focus timer
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid gap-3">
              <p className="onboarding-copy">
                Your dashboard brings today&apos;s completion, streaks, quick actions, and analytics into one matte overview.
              </p>
              <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-muted)] p-4 flex items-center gap-3">
                <Compass className="w-5 h-5 text-[var(--accent-primary)]" />
                <div>
                  <strong className="block text-sm text-[var(--text-primary)]">You are ready</strong>
                  <span className="text-xs text-[var(--text-secondary)]">Profile, theme, and backup live on the dashboard header.</span>
                </div>
              </div>
            </div>
          )}

          <div className="onboarding-actions">
            <button
              type="button"
              onClick={() => onStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="text-sm font-semibold text-[var(--text-muted)] disabled:opacity-40"
            >
              Back
            </button>
            {currentStep === 3 ? (
              <button type="button" onClick={handleCreateHabit} className="dashboard-btn-primary">
                {habitName.trim() ? 'Save & continue' : 'Skip for now'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button type="button" onClick={handleNext} className="dashboard-btn-primary">
                {isLast ? 'Enter dashboard' : 'Continue'}
                {isLast ? <LayoutDashboard className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <p className="text-[10px] text-center text-[var(--text-muted)]">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
