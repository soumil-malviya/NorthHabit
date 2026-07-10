import type { ReactNode } from 'react';

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="legal-section" aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>
        <a href={`#${id}`} aria-label={`Link to ${title}`}>
          {title}
        </a>
      </h2>
      <div className="legal-section-content">{children}</div>
    </section>
  );
}
