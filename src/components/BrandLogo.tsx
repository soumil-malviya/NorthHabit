import { Compass } from 'lucide-react';
import { BRAND } from '../constants/brand';

interface BrandLogoProps {
  compact?: boolean;
  showTagline?: boolean;
  /** Allow tagline to wrap on two lines (mobile drawer) */
  taglineWrap?: boolean;
}

export function BrandLogo({
  compact = false,
  showTagline = !compact,
  taglineWrap = false,
}: BrandLogoProps) {
  return (
    <div className={`brand-logo flex items-center gap-3 min-w-0 ${compact ? 'justify-center w-full' : ''}`}>
      <div className="relative w-10 h-10 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-light)] flex items-center justify-center shadow-[var(--shadow-resting)] shrink-0 select-none">
        <Compass className="w-5 h-5 text-[var(--accent-primary)]" strokeWidth={2.25} />
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent-primary)] opacity-80" />
      </div>
      {!compact && (
        <div className="brand-text hidden group-hover/sb:block min-w-0 flex-1 overflow-hidden">
          <h1 className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            {BRAND.name}
          </h1>
          {showTagline && (
            <p
              className={`text-[10px] text-[var(--text-muted)] font-semibold mt-0.5 leading-snug ${
                taglineWrap
                  ? 'normal-case tracking-normal'
                  : 'font-bold tracking-widest uppercase truncate'
              }`}
            >
              {BRAND.tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
