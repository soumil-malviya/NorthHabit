import type { ReactNode } from 'react';

interface SettingsSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="settings-section" aria-labelledby={`${id}-title`}>
      <header className="settings-section-header">
        <span className="settings-section-eyebrow">{eyebrow}</span>
        <h2 id={`${id}-title`} className="settings-section-title">
          {title}
        </h2>
        {description ? <p className="settings-section-description">{description}</p> : null}
      </header>
      <div className="settings-section-body">{children}</div>
    </section>
  );
}
