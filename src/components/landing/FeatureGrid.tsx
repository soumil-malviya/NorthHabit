import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Calendar, ListTodo, LayoutDashboard, Timer, Shield, WifiOff } from 'lucide-react';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Habit tracker',
    description: 'Track routines with categories, streaks, and history.',
  },
  {
    icon: ListTodo,
    title: 'To-do list',
    description: 'Tasks with dates, notes, and a simple completion flow.',
  },
  {
    icon: Calendar,
    title: 'Time, visualized',
    description: 'See your month breathe. Gentle highlights for the days you showed up.',
  },
  {
    icon: Timer,
    title: 'Focus timer',
    description: 'Timed work sessions with breaks. Each session adds a tree to your forest.',
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
      className="rounded-xl p-6 sm:p-7 border border-[var(--border-light)] bg-[var(--surface-raised)] shadow-[var(--shadow-resting)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[color-mix(in_srgb,var(--accent-primary)_22%,var(--border-light))] hover:shadow-[var(--shadow-lifted)]"
    >
      <div className="w-11 h-11 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-light)] flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-[var(--accent-primary)]" strokeWidth={1.75} />
      </div>
      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export function FeatureGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} id="discover" className="landing-section landing-feature-section relative z-10">
      <div className="landing-container">
        <div className="landing-feature-intro text-center">
          <p className="landing-section-label justify-center">Everything in one calm place</p>
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
