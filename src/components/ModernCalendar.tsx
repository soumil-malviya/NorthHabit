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

  const { cells } = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const first = new Date(y, m, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const grid: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(y, m, d));
    while (grid.length % 7 !== 0) grid.push(null);

    return { cells: grid };
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
      <div className="cal-header">
        <button type="button" onClick={() => goMonth(-1)} className="cal-nav-btn" aria-label="Previous month">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="cal-header-copy">
          <h3>{monthLabel}</h3>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
              onSelect(now);
            }}
            className="cal-today-link"
          >
            Today
          </button>
        </div>

        <button type="button" onClick={() => goMonth(1)} className="cal-nav-btn" aria-label="Next month">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="cal-weekdays">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />;
          }

          const ds = toDateStr(date);
          const markers = getMarkers(ds);
          const isSelected = isSameDay(date, selected);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={ds}
              type="button"
              onClick={() => onSelect(date)}
              className={`cal-cell cal-day ${
                isSelected ? 'cal-day--selected' : isToday ? 'cal-day--today' : ''
              }`}
            >
              <span className="cal-day-number">{date.getDate()}</span>
              {(markers.hasHabit || markers.hasTodo) && (
                <span className="cal-day-dots">
                  {markers.hasHabit ? <span className="cal-dot cal-dot--habit" /> : null}
                  {markers.hasTodo ? <span className="cal-dot cal-dot--todo" /> : null}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
