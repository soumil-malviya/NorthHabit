import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Check, Flame, ListTodo, Timer, TreePine } from 'lucide-react';

const SLIDES = [
  {
    id: 'habits',
    label: 'Habits',
    icon: Flame,
    title: 'Morning clarity',
    items: ['Hydrate', 'Stretch', 'Journal'],
    checked: [true, true, false],
  },
  {
    id: 'todo',
    label: 'To‑Do',
    icon: ListTodo,
    title: 'Today, softly',
    items: ['Deep work block', 'Reply to Sam', 'Walk at dusk'],
    checked: [true, false, false],
  },
  {
    id: 'forest',
    label: 'Focus',
    icon: TreePine,
    title: 'Forest growing',
    items: ['25 min focus', 'Trees +2', 'Break soon'],
    checked: [true, true, false],
  },
  {
    id: 'timer',
    label: 'Pomodoro',
    icon: Timer,
    title: 'In the flow',
    items: ['18:42 remaining', 'Session 3 of 4', 'Breathe'],
    checked: [false, false, false],
  },
] as const;

interface AppMockupProps {
  mouseX?: number;
  mouseY?: number;
}

export function AppMockup({ mouseX = 0, mouseY = 0 }: AppMockupProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4200);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[index];
  const SlideIcon = slide.icon;

  return (
    <motion.div
      style={{
        rotateX: mouseY * 0.4,
        rotateY: mouseX * 0.4,
      }}
      className="relative w-full max-w-[360px] sm:max-w-[420px] mx-auto perspective-[1200px]"
    >
      <div className="landing-product-preview relative">
        <div className="rounded-[1.65rem] overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
          <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--border-light)]">
            <div className="flex gap-1.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === index ? 'bg-cyan-500 w-5' : 'bg-[var(--text-muted)]/40'
                  }`}
                  aria-label={s.label}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {slide.label}
            </span>
          </div>

          <div className="p-4 sm:p-5 min-h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-muted)] border border-[var(--border-light)] flex items-center justify-center">
                    <SlideIcon className="w-4 h-4 text-cyan-500" />
                  </div>
                  <h3 className="font-semibold text-sm">{slide.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {slide.items.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-[var(--text-secondary)] py-2 px-2.5 rounded-xl bg-[var(--surface-muted)]"
                    >
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          slide.checked[i]
                            ? 'bg-cyan-600 border-cyan-600'
                            : 'border-[var(--border-light)]'
                        }`}
                      >
                        {slide.checked[i] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                      <span className={slide.checked[i] ? 'line-through opacity-60' : ''}>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
