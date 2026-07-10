import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Compass, Menu, X } from 'lucide-react';
import { BRAND } from '../../constants/brand';
import { ThemeToggle } from '../ThemeToggle';
import type { ThemeMode } from '../../types';

interface LandingNavProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onGetStarted: () => void;
  isReturning: boolean;
}

const NAV_LINKS = [
  { href: '#philosophy', label: 'Philosophy' },
  { href: '#discover', label: 'Features' },
] as const;

export function LandingNav({ theme, onToggleTheme, onGetStarted, isReturning }: LandingNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="landing-nav-header fixed top-0 inset-x-0 z-50"
    >
      <div className="landing-container">
        <nav className="landing-nav-bar" aria-label="Landing">
          <div className="landing-nav-brand">
            <div className="landing-nav-mark" aria-hidden>
              <Compass className="w-4 h-4" strokeWidth={2.25} />
            </div>
            <span className="font-semibold text-sm tracking-tight truncate">{BRAND.name}</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="landing-nav-actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} iconOnly />
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGetStarted}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
            >
              {isReturning ? 'Continue' : 'Get Started'}
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="md:hidden mt-2 rounded-xl border border-[var(--border-light)] bg-[var(--surface-raised)] p-2 shadow-[var(--shadow-lifted)]"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onGetStarted();
                }}
                className="mt-1 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white"
              >
                {isReturning ? 'Continue' : 'Get Started'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
