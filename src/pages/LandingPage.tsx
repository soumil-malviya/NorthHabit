import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { AmbientBackground } from '../components/landing/AmbientBackground';
import { LandingNav } from '../components/landing/LandingNav';
import { LandingHero } from '../components/landing/LandingHero';
import { PhilosophySection } from '../components/landing/PhilosophySection';
import { FocusGrowthSection } from '../components/landing/FocusGrowthSection';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { AnalyticsPreviewSection } from '../components/landing/AnalyticsPreviewSection';
import { useTheme } from '../hooks/useTheme';
import { useOnboarding } from '../hooks/useOnboarding';
import { BRAND } from '../constants/brand';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isComplete, completeOnboarding } = useOnboarding();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('landing-active');
    return () => document.documentElement.classList.remove('landing-active');
  }, []);

  const enterApp = useCallback(() => {
    setExiting(true);
    completeOnboarding();
    window.setTimeout(() => navigate('/app', { replace: true }), 650);
  }, [completeOnboarding, navigate]);

  const themeMode = theme === 'dark' ? 'dark' : 'light';

  return (
    <AnimatePresence mode="wait">
      {!exiting && (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.01, filter: 'blur(3px)' }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="min-h-screen text-[var(--text-primary)] relative"
        >
          <AmbientBackground theme={themeMode} />
          <LandingNav
            theme={themeMode}
            onToggleTheme={toggleTheme}
            onGetStarted={enterApp}
            isReturning={isComplete}
          />

          <main className="landing-page-flow relative z-10">
            <LandingHero onGetStarted={enterApp} isReturning={isComplete} />
            <PhilosophySection />
            <FocusGrowthSection />
            <AnalyticsPreviewSection />
            <FeatureGrid />
          </main>

          <footer className="px-4 sm:px-6 pb-16 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7 }}
              className="landing-final-cta"
            >
              <h2 className="font-display text-2xl sm:text-3xl mb-3">
                Ready when you are.
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-8 leading-relaxed">
                Step into {BRAND.name}—your habits, tasks, calendar, and forest await in a space
                that respects your pace.
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={enterApp}
              className="landing-primary-cta inline-flex"
              >
                {isComplete ? 'Continue' : 'Get Started'}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
            <p className="text-center text-[10px] text-[var(--text-muted)] mt-8 font-medium tracking-wide">
              {BRAND.name} · private · offline-first
            </p>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
