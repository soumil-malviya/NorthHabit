import { motion, useMotionValue, useSpring } from 'motion/react';
import { useCallback, type MouseEvent } from 'react';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import { BRAND } from '../../constants/brand';
import { AppMockup } from './AppMockup';

interface LandingHeroProps {
  onGetStarted: () => void;
  isReturning: boolean;
}

export function LandingHero({ onGetStarted, isReturning }: LandingHeroProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const handleMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x * 8);
      mouseY.set(-y * 8);
    },
    [mouseX, mouseY],
  );

  const handleLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <section
      className="landing-hero-section relative isolate min-h-[100svh] flex flex-col justify-center"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="landing-container">
      <div className="landing-hero-frame">
        <div className="landing-hero-copy">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="landing-kicker"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Private routines · ambient focus · measurable calm</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="landing-hero-title"
          >
            Design your day with quiet intention.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="landing-hero-subcopy"
          >
            {BRAND.name} brings habits, tasks, focus, and notes into one private workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="landing-hero-actions"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGetStarted}
              className="landing-primary-cta group"
            >
              {isReturning ? 'Continue' : 'Open workspace'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            <a
              href="#philosophy"
              className="landing-secondary-cta"
            >
              How it works
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="landing-hero-visual"
          style={{ rotateX: springY, rotateY: springX }}
        >
          <div className="landing-cinematic-panel" aria-hidden>
            <div className="landing-cinematic-line" />
            <div className="landing-cinematic-copy">
              <Sparkles className="h-4 w-4" />
              Focus session in progress
            </div>
          </div>
          <AppMockup />
        </motion.div>
      </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="landing-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)]"
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--text-muted)] to-transparent"
        />
      </motion.div>
    </section>
  );
}
