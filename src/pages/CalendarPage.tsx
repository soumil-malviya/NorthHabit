import { useState, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ListTodo, Sparkles } from 'lucide-react';
import { ModernCalendar } from '../components/ModernCalendar';
import { useHabits } from '../hooks/useHabits';
import { useTodos } from '../hooks/useTodos';
import { formatFriendlyDate } from '../utils';

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CalendarPage() {
  const { habits } = useHabits();
  const { todos } = useTodos();
  const [selected, setSelected] = useState<Date>(() => new Date());

  const selectedStr = toDateStr(selected);

  const getMarkers = useCallback(
    (dateStr: string) => ({
      hasHabit: habits.some((h) => h.logs.includes(dateStr)),
      hasTodo: todos.some((t) => t.scheduledDate === dateStr),
    }),
    [habits, todos],
  );

  const habitsOnDay = useMemo(
    () => habits.filter((h) => h.logs.includes(selectedStr)),
    [habits, selectedStr],
  );

  const todosOnDay = useMemo(
    () => todos.filter((t) => t.scheduledDate === selectedStr),
    [todos, selectedStr],
  );

  const monthStats = useMemo(() => {
    const y = selected.getFullYear();
    const m = selected.getMonth();
    let habitDays = 0;
    let todoDays = 0;
    const days = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const ds = toDateStr(new Date(y, m, d));
      if (habits.some((h) => h.logs.includes(ds))) habitDays++;
      if (todos.some((t) => t.scheduledDate === ds)) todoDays++;
    }
    return { habitDays, todoDays };
  }, [habits, todos, selected]);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="pb-5 border-b border-slate-200 dark:border-white/5 mb-6">
        <h2 className="text-xl font-extrabold tracking-tight dark:text-white text-slate-850 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          Calendar
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Habits completed and scheduled to‑dos at a glance
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 glass-panel p-5 sm:p-6 rounded-2xl">
          <ModernCalendar
            selected={selected}
            onSelect={setSelected}
            getMarkers={getMarkers}
          />
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-200/80 dark:border-white/5">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Habits
            </span>
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              To‑dos
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono">
              {monthStats.habitDays} habit · {monthStats.todoDays} todo days this month
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5 rounded-2xl sticky top-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                  Selected day
                </p>
                <h3 className="text-lg font-extrabold dark:text-white text-slate-800 mt-0.5">
                  {formatFriendlyDate(selectedStr)}
                </h3>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <section className="mb-5">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Habits logged
                <span className="ml-auto text-emerald-600 dark:text-emerald-400 font-mono">
                  {habitsOnDay.length}
                </span>
              </h4>
              {habitsOnDay.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 px-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.02]">
                  No habits completed this day.
                </p>
              ) : (
                <ul className="space-y-2">
                  {habitsOnDay.map((h) => (
                    <li
                      key={h.id}
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200 py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {h.name}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2.5 flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-blue-500" />
                Scheduled to‑dos
                <span className="ml-auto text-blue-600 dark:text-blue-400 font-mono">
                  {todosOnDay.length}
                </span>
              </h4>
              {todosOnDay.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 px-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.02]">
                  No to‑dos scheduled this day.
                </p>
              ) : (
                <ul className="space-y-2">
                  {todosOnDay.map((t) => (
                    <li
                      key={t.id}
                      className={`text-sm font-semibold py-2.5 px-3 rounded-xl border flex items-center gap-2 ${
                        t.completed
                          ? 'line-through opacity-60 bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/5 text-slate-500'
                          : 'bg-blue-500/10 border-blue-500/20 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          t.completed ? 'bg-slate-400' : 'bg-blue-500'
                        }`}
                      />
                      {t.title}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
