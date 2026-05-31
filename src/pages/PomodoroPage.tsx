import { Timer } from 'lucide-react';
import { PomodoroTimer } from '../components/PomodoroTimer';

export default function PomodoroPage() {
  return (
    <div>
      <header className="pb-6 mb-6 text-center max-w-md mx-auto">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] flex items-center justify-center gap-2 font-display">
          <Timer className="w-4 h-4 text-cyan-600/80 dark:text-cyan-400/80" strokeWidth={1.75} />
          Focus grove
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
          Each session grows a procedural tree in your persistent ecosystem. Longer focus, deeper
          roots.
        </p>
      </header>
      <PomodoroTimer />
    </div>
  );
}
