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
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 via-teal-600 to-slate-800 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0 select-none">
        <Compass className="w-5 h-5 text-cyan-100" strokeWidth={2.25} />
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
      </div>
      {!compact && (
        <div className="brand-text hidden group-hover/sb:block min-w-0 flex-1 overflow-hidden">
          <h1 className="text-lg font-extrabold tracking-tight dark:text-white text-slate-850 leading-tight">
            {BRAND.name}
          </h1>
          {showTagline && (
            <p
              className={`text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 leading-snug ${
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
