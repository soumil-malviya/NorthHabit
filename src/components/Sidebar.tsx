import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Timer,
  Bell,
  X,
  Menu,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BRAND } from '../constants/brand';
import { SidebarProgressCard } from './SidebarProgressCard';
import type { Habit } from '../types';

const NAV_ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/todo', label: 'To‑Do', icon: ListTodo, end: false },
  { to: '/app/calendar', label: 'Calendar', icon: Calendar, end: false },
  { to: '/app/pomodoro', label: 'Pomodoro', icon: Timer, end: false },
  { to: '/app/reminders', label: 'Reminders', icon: Bell, end: false },
] as const;

interface SidebarProps {
  habits: Habit[];
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `sidebar-nav-link relative flex items-center gap-3 rounded-xl text-sm font-semibold ${
    isActive
      ? 'sidebar-nav-active bg-[var(--accent-primary)] text-white shadow-sm'
      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
  }`;

function NavMenu({ onNavClick, showLabels = true }: { onNavClick?: () => void; showLabels?: boolean }) {
  return (
    <nav className="flex-1 space-y-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={navLinkClass}
          onClick={onNavClick}
        >
          <span className="sidebar-nav-icon">
            <Icon className="w-5 h-5 shrink-0" />
          </span>
          {showLabels ? (
            <span className="sidebar-nav-label hidden group-hover/sb:inline whitespace-nowrap">
              {label}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar({
  habits,
  mobileOpen,
  onMobileClose,
  onMobileOpen,
}: SidebarProps) {
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        onClick={onMobileOpen}
        className={`lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl glass-panel text-[var(--text-secondary)] active:scale-95 transition-opacity ${
          mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className="sidebar-desktop group/sb hidden lg:flex shrink-0 self-stretch min-h-full flex-col w-[4.75rem] hover:w-64 border-r border-[var(--border-light)] bg-[var(--bg-secondary)] transition-[width] duration-200 ease-[cubic-bezier(0.33,1,0.68,1)] overflow-hidden"
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full w-full p-3">
          <div className="sidebar-logo-wrap mb-6 shrink-0">
            <BrandLogo showTagline={false} />
          </div>
          <div className="sidebar-progress-wrap mb-4 shrink-0">
            <SidebarProgressCard habits={habits} />
          </div>
          <NavMenu showLabels />
        </div>
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ease-out ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
            className={`absolute inset-0 bg-slate-950/55 transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onMobileClose}
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <aside
          className={`mobile-drawer absolute inset-y-2 left-2 w-[min(17.5rem,calc(100vw-1rem))] flex flex-col rounded-2xl border border-[var(--border-light)] bg-[var(--bg-tertiary)] shadow-[var(--shadow-lifted)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <header className="flex items-start justify-between gap-3 p-4 pb-3 border-b border-slate-200/80 dark:border-white/10 shrink-0">
            <BrandLogo showTagline taglineWrap />
            <button
              type="button"
              onClick={onMobileClose}
              className="shrink-0 p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="mb-3">
              <SidebarProgressCard habits={habits} />
            </div>
            <nav className="space-y-1" aria-label="Main navigation">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `mobile-nav-link relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'sidebar-nav-active bg-[var(--accent-primary)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] active:bg-[var(--surface-hover)]'
                    }`
                  }
                >
                  <span className="sidebar-nav-icon">
                    <Icon className="w-5 h-5 shrink-0" />
                  </span>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <footer className="p-4 pt-3 border-t border-slate-200/80 dark:border-white/10 shrink-0">
            <p className="text-[10px] text-[var(--text-muted)] text-center">
              {BRAND.name} · Profile & theme on Dashboard
            </p>
          </footer>
        </aside>
      </div>
    </>
  );
}
