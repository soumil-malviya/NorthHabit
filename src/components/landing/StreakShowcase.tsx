import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Flame } from 'lucide-react';

const STREAK_DAYS = 14;

export function StreakShowcase() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="landing-section relative z-10 py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="landing-glass rounded-3xl p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600/90 dark:text-cyan-400/90 mb-3">
                Gentle momentum
              </p>
              <h2 className="font-display text-3xl sm:text-4xl leading-tight text-[var(--text-primary)]">
                Streaks that feel like warmth,
                <br />
                <span className="italic text-[var(--text-secondary)]">not pressure.</span>
              </h2>
              <p className="mt-4 text-[var(--text-secondary)] text-sm sm:text-base max-w-md leading-relaxed">
                Each day you return, your rhythm grows. No guilt—just a quiet glow when you show up
                for yourself.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <motion.div
                animate={inView ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="landing-streak-flame w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/10 flex items-center justify-center border border-orange-500/20"
              >
                <Flame className="w-8 h-8 text-orange-400" fill="currentColor" fillOpacity={0.35} />
              </motion.div>
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 }}
                  className="font-display text-5xl sm:text-6xl text-[var(--text-primary)] leading-none"
                >
                  {STREAK_DAYS}
                </motion.p>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">days in rhythm</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 justify-center sm:justify-start">
            {Array.from({ length: STREAK_DAYS }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className={`w-3 h-8 sm:w-3.5 sm:h-9 rounded-full ${
                  i >= STREAK_DAYS - 3
                    ? 'bg-gradient-to-t from-orange-500/80 to-amber-400/60 shadow-[0_0_12px_rgba(249,115,22,0.35)]'
                    : i >= STREAK_DAYS - 7
                      ? 'bg-cyan-600/50'
                      : 'bg-[var(--border-light)]'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
