import type { ReactNode } from 'react';

interface SettingsRowProps {
  label: string;
  value: ReactNode;
  hint?: string;
  action?: ReactNode;
}

export function SettingsRow({ label, value, hint, action }: SettingsRowProps) {
  return (
    <div className="settings-row">
      <div className="settings-row-copy">
        <span className="settings-row-label">{label}</span>
        {hint ? <span className="settings-row-hint">{hint}</span> : null}
      </div>
      <div className="settings-row-value">{value}</div>
      {action ? <div className="settings-row-action">{action}</div> : null}
    </div>
  );
}
