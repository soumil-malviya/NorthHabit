import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export interface DayMarkers {
  hasHabit: boolean;
  hasTodo: boolean;
}

interface ModernCalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  getMarkers: (dateStr: string) => DayMarkers;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ModernCalendar({ selected, onSelect, getMarkers }: ModernCalendarProps) {
  const [viewDate, setViewDate] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );

  const today = useMemo(() => new Date(), []);

  const { year, month, cells } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const first = new Date(y, m, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const grid: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(y, m, d));
    while (grid.length % 7 !== 0) grid.push(null);

    return { year: y, month: m, cells: grid };
  }, [viewDate]);

  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const goMonth = (delta: number) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  return (
    <div className="modern-calendar select-none">
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          className="cal-nav-btn"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <h3 className="text-lg font-extrabold tracking-tight dark:text-white text-slate-800">
            {monthLabel}
          </h3>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
              onSelect(now);
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 mt-0.5 transition-colors"
          >
            Jump to today
          </button>
        </div>

        <button
          type="button"
          onClick={() => goMonth(1)}
          className="cal-nav-btn"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1"
          >
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const ds = toDateStr(date);
          const markers = getMarkers(ds);
          const isSelected = isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          const hasBoth = markers.hasHabit && markers.hasTodo;

          return (
            <button
              key={ds}
              type="button"
              onClick={() => onSelect(date)}
              className={`cal-day aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all duration-200 ${
                isSelected
                  ? 'cal-day-selected'
                  : isToday
                    ? 'cal-day-today'
                    : 'cal-day-default'
              }`}
            >
              <span
                className={`text-sm font-bold tabular-nums ${
                  isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                {date.getDate()}
              </span>
              {(markers.hasHabit || markers.hasTodo) && (
                <span className="flex gap-0.5 mt-1">
                  {markers.hasHabit && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-emerald-200' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                  {markers.hasTodo && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-blue-200' : 'bg-blue-500'
                      }`}
                    />
                  )}
                  {hasBoth && !isSelected && (
                    <span className="sr-only">habits and todos</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
