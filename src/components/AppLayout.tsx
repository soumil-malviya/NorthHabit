import { useState, useMemo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { AmbientBackground } from './ambient/AmbientBackground';
import { AmbientSettingsProvider } from '../contexts/AmbientSettingsContext';
import { SoundscapeProvider } from '../contexts/SoundscapeContext';
import { SoundscapeMiniPlayer } from './soundscape/SoundscapeMiniPlayer';
import { QuickActionsMenu } from './QuickActionsMenu';
import { MotionPage } from './motion/MotionPage';
import { AppChrome } from './AppChrome';
import { OnboardingExperience } from './onboarding/OnboardingExperience';
import {
  NotificationPermissionBanner,
  enableNotificationsFlow,
} from './notifications/NotificationPermissionBanner';
import { useTheme } from '../hooks/useTheme';
import { useHabits } from '../hooks/useHabits';
import { useOnboarding } from '../hooks/useOnboarding';
import { useNotificationPrefs } from '../hooks/useNotificationPrefs';
import { useNotificationScheduler } from '../hooks/useNotificationScheduler';
import { useLocalStorageString } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../constants/storage';
import { BRAND } from '../constants/brand';
import { calculateStreak } from '../utils';
import type { ThemeMode } from '../types';
import type { AppOutletContext } from '../types/appContext';

export function AppLayout() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { habits } = useHabits();
  const {
    isComplete: onboardingComplete,
    currentStep,
    totalSteps,
    setStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding();
  const [username, setUsername] = useLocalStorageString(
    STORAGE_KEYS.username,
    BRAND.defaultUsername,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const { prefs, setPrefs, permission } = useNotificationPrefs();
  useNotificationScheduler();

  const showPermissionBanner =
    (permission === 'default' && !prefs.permissionAsked) ||
    (permission === 'denied' && prefs.enabled);

  const location = useLocation();

  const maxStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h) => calculateStreak(h.logs).currentStreak));
  }, [habits]);

  useEffect(() => {
    document.documentElement.classList.add('app-route-active');
    document.body.classList.add('app-route-active');
    return () => {
      document.documentElement.classList.remove('app-route-active');
      document.body.classList.remove('app-route-active');
    };
  }, []);

  return (
    <AmbientSettingsProvider>
      <SoundscapeProvider>
      <div className="app-shell min-h-screen w-full overflow-x-hidden text-[var(--text-primary)]">
        <AmbientBackground theme={theme as ThemeMode} />

        <div className="app-shell-content w-full lg:flex lg:items-stretch">
        <Sidebar
          habits={habits}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onMobileOpen={() => setMobileOpen(true)}
        />

        <AppChrome />

        <main className="app-main selection:bg-cyan-500/25">
          <NotificationPermissionBanner
            visible={showPermissionBanner}
            permission={permission}
            onEnable={() => void enableNotificationsFlow(setPrefs)}
            onDismiss={() => setPrefs((p) => ({ ...p, permissionAsked: true }))}
          />
          <AnimatePresence mode="wait" initial={false}>
            <div key={location.pathname}>
              <MotionPage>
                <Outlet
                  context={
                    {
                      theme: theme as ThemeMode,
                      username,
                      setUsername,
                      maxStreak,
                      toggleTheme,
                    } satisfies AppOutletContext
                  }
                />
              </MotionPage>
            </div>
          </AnimatePresence>
        </main>

        <div className="floating-controls-dock" aria-label="Quick controls">
          <QuickActionsMenu habits={habits} />
          <SoundscapeMiniPlayer />
        </div>
        </div>

        {!onboardingComplete && (
          <OnboardingExperience
            theme={theme as ThemeMode}
            onThemeChange={setTheme}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onStepChange={setStep}
            onComplete={completeOnboarding}
            onSkip={skipOnboarding}
          />
        )}
      </div>
      </SoundscapeProvider>
    </AmbientSettingsProvider>
  );
}
