import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Calendar, ListTodo, LayoutDashboard, Timer, Shield, WifiOff } from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Habit sanctuary',
    description: 'Track rituals with warmth—categories, streaks, and heatmaps without the hustle culture.',
  },
  {
    icon: ListTodo,
    title: 'To‑do, softened',
    description: 'Tasks that feel light. Check them off with a satisfying motion, not a corporate checklist.',
  },
  {
    icon: Calendar,
    title: 'Time, visualized',
    description: 'See your month breathe. Gentle highlights for the days you showed up.',
  },
  {
    icon: Timer,
    title: 'Pomodoro grove',
    description: 'Focus intervals that grow your forest. Work, break, repeat—at human pace.',
  },
  {
    icon: WifiOff,
    title: 'Offline-first',
    description: 'Your data stays on your device. Private, fast, and there when Wi‑Fi isn’t.',
  },
  {
    icon: Shield,
    title: 'No noise',
    description: 'No ads, no feeds, no dark patterns—just tools for a steadier you.',
  },
] as const;

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="landing-glass landing-card-hover rounded-2xl p-6 sm:p-7"
    >
      <div className="w-11 h-11 rounded-xl bg-cyan-600/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} />
      </div>
      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export function FeatureGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} id="discover" className="landing-section py-20 sm:py-28 px-4 sm:px-6 relative z-10">

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600/90 dark:text-cyan-400/90 mb-3">
            Everything in one calm place
          </p>
          <h2 className="landing-editorial-title mx-auto text-center">
            Built for steady days.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title}>
              <FeatureCard feature={f} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
