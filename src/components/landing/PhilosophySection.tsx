import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const PRINCIPLES = [
  ['01', 'Less friction', 'Capture what matters without turning your day into admin work.'],
  ['02', 'Visible rhythm', 'See streaks, routines, and focus as a gentle pattern, not a scoreboard.'],
  ['03', 'Private by default', 'Your workspace stays local, fast, and quiet.'],
] as const;

export function PhilosophySection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} id="philosophy" className="landing-story-section landing-section">
      <div className="landing-editorial-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="landing-section-label">Ambient productivity philosophy</p>
          <h2 className="landing-editorial-title">
            The app should disappear when your life becomes clearer.
          </h2>
        </motion.div>

        <div className="landing-principle-stack">
          {PRINCIPLES.map(([index, title, body], i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.12 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="landing-principle"
            >
              <span>{index}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
