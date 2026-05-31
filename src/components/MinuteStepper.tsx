import { Minus, Plus } from 'lucide-react';

interface MinuteStepperProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
}

export function MinuteStepper({
  value,
  onChange,
  label,
  min = 1,
  max = 240,
}: MinuteStepperProps) {
  const safeValue = Math.max(min, Math.min(max, Math.round(value || min)));
  const update = (next: number) => onChange(Math.max(min, Math.min(max, next)));

  return (
    <div className="minute-stepper" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => update(safeValue - 5)}
        className="minute-stepper-button"
        aria-label={`${label}: decrease by 5 minutes`}
        disabled={safeValue <= min}
      >
        <Minus className="h-3 w-3" />
      </button>
      <div className="minute-stepper-value" aria-live="polite">
        <span>{safeValue}</span>
        <small>m</small>
      </div>
      <button
        type="button"
        onClick={() => update(safeValue + 5)}
        className="minute-stepper-button"
        aria-label={`${label}: increase by 5 minutes`}
        disabled={safeValue >= max}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
