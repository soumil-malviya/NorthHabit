import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const BARS = [42, 58, 51, 72, 64, 86, 78];

export function AnalyticsPreviewSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="landing-analytics-section landing-section">
      <div className="landing-container">
        <div className="landing-analytics-layout">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="landing-analytics-copy"
          >
            <p className="landing-section-label">Overview</p>
            <h2 className="landing-editorial-title">Progress at a glance.</h2>
            <p>
              NorthHabit summarizes completion, streaks, consistency, and focused minutes in a
              layout that stays out of the way.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
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
              <span>6 clear days</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
