import { useEffect, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { AmbientBackground } from '../landing/AmbientBackground';
import { ThemeToggle } from '../ThemeToggle';
import { TableOfContents, type TocItem } from './TableOfContents';
import { BRAND } from '../../constants/brand';
import { useTheme } from '../../hooks/useTheme';

export function LegalLayout({
  title,
  eyebrow,
  description,
  lastUpdated,
  toc,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  lastUpdated: string;
  toc: TocItem[];
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const themeMode = theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    document.documentElement.classList.add('landing-active');
    return () => document.documentElement.classList.remove('landing-active');
  }, []);

  useEffect(() => {
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = previous;
    };
  }, []);

  return (
    <div className="min-h-screen text-[var(--text-primary)] relative">
      <AmbientBackground theme={themeMode} />
      <header className="landing-nav-header fixed top-0 inset-x-0 z-50">
        <div className="landing-container">
          <nav className="landing-nav-bar" aria-label="Legal">
            <Link to="/" className="landing-nav-brand">
              <div className="landing-nav-mark" aria-hidden>
                <Compass className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <span className="font-semibold text-sm tracking-tight truncate">{BRAND.name}</span>
            </Link>

            <div className="landing-nav-actions">
              <ThemeToggle theme={theme} onToggle={toggleTheme} iconOnly />
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
              >
                Open app
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="legal-page relative z-10">
        <div className="landing-container">
          <Link to="/" className="legal-back-link">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to NorthHabit
          </Link>

          <div className="legal-grid">
            <TableOfContents items={toc} />
            <article className="legal-article" aria-labelledby="legal-title">
              <header className="legal-hero">
                <p className="landing-section-label">{eyebrow}</p>
                <h1 id="legal-title">{title}</h1>
                <p>{description}</p>
                <div className="legal-updated" aria-label="Last updated">
                  <span>Last Updated</span>
                  <time dateTime={lastUpdated}>{lastUpdated}</time>
                </div>
              </header>
              {children}
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
