import { motion, useInView } from 'motion/react';
import type { Key } from 'react';
import { useRef } from 'react';

const TREES = [
  { x: 42, scale: 0.78, lean: -2, variant: 'pine' },
  { x: 98, scale: 0.92, lean: 1.5, variant: 'rounded' },
  { x: 160, scale: 1.08, lean: -1, variant: 'pine' },
  { x: 222, scale: 0.88, lean: 2, variant: 'rounded' },
  { x: 278, scale: 0.74, lean: -1.5, variant: 'pine' },
] as const;

function PreviewTree({
  x,
  scale,
  lean,
  variant,
}: {
  key?: Key;
  x: number;
  scale: number;
  lean: number;
  variant: 'pine' | 'rounded';
}) {
  const trunkW = 5.5 * scale;
  const trunkH = 17 * scale;

  return (
    <g transform={`translate(${x}, ${78 - trunkH}) scale(${scale}) rotate(${lean})`}>
      <ellipse cx={0} cy={trunkH + 1} rx={12} ry={2.8} fill="var(--text-muted)" opacity={0.1} />
      <rect
        x={-trunkW / 2 / scale}
        y={0}
        width={trunkW / scale}
        height={trunkH / scale}
        rx={1.4}
        fill="var(--text-muted)"
        opacity={0.58}
      />
      <path
        d={`M${-trunkW / 2 / scale + 1} 1.5 C${-1.5} 6, ${-1} 11, ${-1.5} ${trunkH / scale - 1}`}
        stroke="var(--surface-raised)"
        strokeWidth={0.85}
        strokeLinecap="round"
        opacity={0.48}
        fill="none"
      />
      <path
        d={`M0 6 C-4 8, -7 10, -10 13 M0 8 C4 10, 7 12, 9 15`}
        stroke="var(--text-muted)"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.35}
        fill="none"
      />

      {variant === 'pine' ? (
        <g transform="translate(0 -2)">
          <path
            d="M0 -35 L18 -7 C10 -8 5 -7 0 -4 C-5 -7 -10 -8 -18 -7 Z"
            fill="var(--accent-primary)"
            opacity={0.9}
          />
          <path
            d="M0 -25 L22 6 C12 4 5 5 0 9 C-5 5 -12 4 -22 6 Z"
            fill="var(--accent-primary)"
            opacity={0.78}
          />
          <path
            d="M0 -15 L17 10 C10 9 4 10 0 13 C-4 10 -10 9 -17 10 Z"
            fill="var(--accent-primary)"
            opacity={0.62}
          />
          <path
            d="M-8 -16 C-3 -18, 4 -18, 10 -15"
            stroke="var(--surface-raised)"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.34}
            fill="none"
          />
        </g>
      ) : (
        <g transform="translate(0 -14)">
          <circle cx={-9} cy={-7} r={11} fill="var(--accent-primary)" opacity={0.66} />
          <circle cx={7} cy={-11} r={13} fill="var(--accent-primary)" opacity={0.86} />
          <circle cx={-1} cy={-23} r={12} fill="var(--accent-primary)" opacity={0.74} />
          <circle cx={13} cy={-1} r={9} fill="var(--accent-primary)" opacity={0.58} />
          <path
            d="M-9 -16 C-2 -21, 7 -21, 14 -16"
            stroke="var(--surface-raised)"
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.32}
            fill="none"
          />
        </g>
      )}
    </g>
  );
}

export function FocusGrowthSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="landing-section landing-feature-section relative z-10 overflow-hidden">
      <div className="landing-container">
        <div className="landing-editorial-grid items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="landing-focus-copy"
          >
            <p className="landing-section-label">Focus timer</p>
            <h2 className="landing-editorial-title">
              Focus that leaves a trace.
            </h2>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-md">
              Each session is recorded quietly. Trees accumulate over time — a simple record of
              where your attention went.
            </p>
            <ul className="space-y-2.5 sm:space-y-3 text-sm text-[var(--text-secondary)]">
              {[
                '25-minute work intervals',
                'Trees that grow with consistency',
                'Breaks spaced between sessions',
              ].map((line) => (
                <motion.li
                  key={line}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                  {line}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="landing-analytics-panel landing-focus-panel"
          >
            <svg viewBox="0 0 320 96" className="w-full h-auto" aria-hidden>
              <defs>
                <linearGradient id="landing-tree-ground" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="var(--border-light)" stopOpacity={0.35} />
                  <stop offset="50%" stopColor="var(--border-light)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="var(--border-light)" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <line
                x1={0}
                y1={78}
                x2={320}
                y2={78}
                stroke="url(#landing-tree-ground)"
                strokeWidth={1}
              />
              <path
                d="M16 82 C36 77, 57 84, 80 79 S122 82, 148 79 S197 82, 223 79 S265 83, 304 79"
                stroke="var(--border-light)"
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.6}
                fill="none"
              />
              {TREES.map((tree) => (
                <PreviewTree
                  key={tree.x}
                  x={tree.x}
                  scale={tree.scale}
                  lean={tree.lean}
                  variant={tree.variant}
                />
              ))}
            </svg>
            <p className="text-center text-xs text-[var(--text-muted)] mt-4 font-medium">
              Session 12 · 4 trees this week
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
