import { useEffect, useState } from 'react';

interface MinuteDurationInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
}

function parseMinutes(raw: string, fallback: number, min: number) {
  const trimmed = raw.trim().replace(/[^\d]/g, '');
  if (!trimmed) return fallback;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, parsed);
}

export function MinuteDurationInput({
  value,
  onChange,
  label,
  min = 1,
}: MinuteDurationInputProps) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const next = parseMinutes(raw, value, min);
    onChange(next);
    setDraft(String(next));
  };

  return (
    <div className="minute-duration-input" role="group" aria-label={label}>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(draft);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="minute-duration-field"
        aria-label={`${label} in minutes`}
      />
      <span className="minute-duration-suffix">min</span>
    </div>
  );
}
