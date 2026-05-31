import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

function MiniTree({ x, scale, delay }: { x: number; scale: number; delay: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      transform={`translate(${x}, 72) scale(${scale})`}
      style={{ transformOrigin: 'center bottom' }}
    >
      <rect x={-2} y={-8} width={4} height={8} fill="#5c4033" rx={1} />
      <path d="M0 -28 L-10 -8 L10 -8 Z" fill="#166534" />
    </motion.g>
  );
}

export function FocusGrowthSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="landing-section relative z-10 py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="landing-editorial-grid items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600/90 dark:text-emerald-400/90 mb-3">
            Focus ecosystem
          </p>
          <h2 className="font-display text-3xl sm:text-4xl leading-tight">
            Focus that leaves a trace.
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed max-w-md">
            Each focus session becomes a small artifact of care. The grove grows slowly, visibly,
            and without turning your work into a game.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
            {['25-minute deep work rhythms', 'Trees that mature with consistency', 'Breaks that feel earned, not rushed'].map(
              (line, i) => (
                <motion.li
                  key={line}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {line}
                </motion.li>
              ),
            )}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="landing-analytics-panel relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
          <svg viewBox="0 0 320 100" className="w-full h-auto" aria-hidden>
            <defs>
              <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(22,101,52,0.15)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <rect x={0} y={78} width={320} height={22} fill="url(#ground)" />
            <line x1={0} y1={78} x2={320} y2={78} stroke="rgba(22,101,52,0.25)" strokeWidth={1} />
            {inView && (
              <>
                <MiniTree x={50} scale={0.7} delay={0.1} />
                <MiniTree x={110} scale={0.85} delay={0.25} />
                <MiniTree x={170} scale={1} delay={0.4} />
                <MiniTree x={230} scale={0.9} delay={0.55} />
                <MiniTree x={280} scale={0.75} delay={0.7} />
              </>
            )}
            <motion.circle
              cx={160}
              cy={20}
              r={40}
              fill="rgba(34,211,238,0.08)"
              animate={inView ? { r: [38, 44, 38], opacity: [0.5, 0.8, 0.5] } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
          <p className="text-center text-xs text-[var(--text-muted)] mt-4 font-medium">
            Session 12 · 4 trees added this week
          </p>
        </motion.div>
      </div>
    </section>
  );
}
