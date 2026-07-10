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
  { to: '/app/todo', label: 'To-do', icon: ListTodo, end: false },
  { to: '/app/calendar', label: 'Calendar', icon: Calendar, end: false },
  { to: '/app/pomodoro', label: 'Focus', icon: Timer, end: false },
  { to: '/app/reminders', label: 'Reminders', icon: Bell, end: false },
] as const;

interface SidebarProps {
  habits: Habit[];
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
}

function NavMenu({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <nav className="sidebar-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavClick}
          className={({ isActive }) => `sidebar-nav-item${isActive ? ' is-active' : ''}`}
        >
          <Icon className="sidebar-nav-item-icon" strokeWidth={1.75} />
          <span className="sidebar-nav-label">{label}</span>
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
        className={`app-menu-button lg:hidden p-2 rounded-lg border border-[var(--border-light)] bg-[var(--surface-raised)] text-[var(--text-secondary)] ${
          mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside className="sidebar-shell group/sb hidden lg:flex" aria-label="Sidebar">
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <BrandLogo showTagline={false} />
          </div>

          <SidebarProgressCard habits={habits} />

          <NavMenu />
        </div>
      </aside>

      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`sidebar-overlay absolute inset-0 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onMobileClose}
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <aside
          className={`sidebar-drawer ${mobileOpen ? 'is-open' : 'is-closed'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <header className="sidebar-drawer-header">
            <BrandLogo showTagline={false} forceShowName />
            <button
              type="button"
              onClick={onMobileClose}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="sidebar-drawer-body">
            <SidebarProgressCard habits={habits} />
            <NavMenu onNavClick={onMobileClose} />
          </div>

          <footer className="sidebar-drawer-footer">
            <p className="text-[11px] text-[var(--text-muted)]">{BRAND.name}</p>
          </footer>
        </aside>
      </div>
    </>
  );
}
