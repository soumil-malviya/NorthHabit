import { Timer } from 'lucide-react';
import { PomodoroTimer } from '../components/PomodoroTimer';

export default function PomodoroPage() {
  return (
    <div>
      <header className="pb-5 border-b border-slate-200 dark:border-white/5 mb-8 text-center sm:text-left">
        <h2 className="text-xl font-extrabold tracking-tight dark:text-white text-slate-850 flex items-center justify-center sm:justify-start gap-2">
          <Timer className="w-5 h-5 text-blue-500" />
          Pomodoro
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Focus sessions with configurable work and break intervals
        </p>
      </header>
      <PomodoroTimer />
    </div>
  );
}
