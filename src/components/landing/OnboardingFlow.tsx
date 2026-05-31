import { motion, useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Compass, Leaf, Moon, Sunrise } from 'lucide-react';

const CARDS = [
  {
    icon: Sunrise,
    title: 'Arrive softly',
    body: 'Open NorthHabit when the day feels heavy or bright. No dashboards shouting—just room to breathe.',
    accent: 'from-amber-500/20 to-orange-500/5',
  },
  {
    icon: Compass,
    title: 'Choose your north',
    body: 'Pick a few habits that matter. Small anchors—water, walk, read—that compound without noise.',
    accent: 'from-cyan-500/20 to-teal-600/5',
  },
  {
    icon: Leaf,
    title: 'Grow with focus',
    body: 'Each Pomodoro plants a tree. Watch your forest thicken as concentration becomes a ritual.',
    accent: 'from-emerald-500/20 to-green-600/5',
  },
  {
    icon: Moon,
    title: 'Rest without guilt',
    body: 'Miss a day? The streak pauses, not punishes. Return tomorrow; the app welcomes you back.',
    accent: 'from-indigo-500/15 to-violet-500/5',
  },
] as const;

export function OnboardingFlow() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [active, setActive] = useState(0);

  const card = CARDS[active];
  const Icon = card.icon;

  return (
    <section ref={ref} className="landing-section relative z-10 scroll-mt-28 py-20 sm:py-28 px-4 sm:px-6" id="onboarding">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600/90 dark:text-cyan-400/90 mb-3"
        >
          Your first moments
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]"
        >
          Onboarding that feels like a <span className="italic">deep breath.</span>
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="max-w-lg mx-auto"
      >
        <div className={`landing-glass rounded-3xl p-8 sm:p-10 relative overflow-hidden bg-gradient-to-br ${card.accent}`}>
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-14 h-14 rounded-2xl landing-glass flex items-center justify-center mb-6 mx-auto">
              <Icon className="w-7 h-7 text-cyan-500" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl text-center mb-3">{card.title}</h3>
            <p className="text-center text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
              {card.body}
            </p>
          </motion.div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-light)]">
            <button
              type="button"
              onClick={() => setActive((a) => (a === 0 ? CARDS.length - 1 : a - 1))}
              className="w-10 h-10 rounded-xl landing-glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === active ? 'w-8 bg-cyan-500' : 'w-1.5 bg-[var(--text-muted)]/50'
                  }`}
                  aria-label={`Card ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActive((a) => (a + 1) % CARDS.length)}
              className="w-10 h-10 rounded-xl landing-glass flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
