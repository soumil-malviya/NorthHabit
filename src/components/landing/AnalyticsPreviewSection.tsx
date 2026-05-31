import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const BARS = [42, 58, 51, 72, 64, 86, 78];
const QUOTES = [
  'NorthHabit feels like a quiet room for my week.',
  'The focus grove made consistency feel less mechanical.',
  'It gives me signal without turning progress into pressure.',
] as const;

export function AnalyticsPreviewSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="landing-analytics-section landing-section">
      <div className="landing-analytics-layout">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="landing-analytics-copy"
        >
          <p className="landing-section-label">Measured, never noisy</p>
          <h2 className="landing-editorial-title">Progress you can feel at a glance.</h2>
          <p>
            NorthHabit turns routine data into calm visual language: completion, streaks,
            consistency, and focused minutes, all without a dashboard shouting for attention.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="landing-analytics-panel"
        >
          <div className="landing-analytics-header">
            <span>Weekly consistency</span>
            <strong>78%</strong>
          </div>
          <div className="landing-bar-chart" aria-hidden>
            {BARS.map((bar, index) => (
              <motion.span
                key={index}
                initial={{ height: '18%' }}
                animate={inView ? { height: `${bar}%` } : {}}
                transition={{ duration: 0.65, delay: 0.25 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
          <div className="landing-analytics-stats">
            <span>14d streak</span>
            <span>9 focus trees</span>
            <span>6 calm days</span>
          </div>
        </motion.div>
      </div>

      <div className="landing-proof-row" aria-label="User reflections">
        {QUOTES.map((quote, index) => (
          <motion.blockquote
            key={quote}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 + index * 0.08 }}
          >
            “{quote}”
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
