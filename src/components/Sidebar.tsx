import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Timer,
  X,
  Menu,
  Flame,
  Edit2,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { BRAND } from '../constants/brand';
import type { ThemeMode } from '../types';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/todo', label: 'To‑Do', icon: ListTodo, end: false },
  { to: '/calendar', label: 'Calendar', icon: Calendar, end: false },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer, end: false },
] as const;

interface SidebarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  username: string;
  onUsernameChange: (name: string) => void;
  maxStreak: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `sidebar-nav-link flex items-center gap-3 rounded-xl text-sm font-semibold ${
    isActive
      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
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
          <Icon className="w-5 h-5 shrink-0" />
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

function UsernameChip({
  username,
  onUsernameChange,
}: {
  username: string;
  onUsernameChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(username);

  const commit = () => {
    const next = temp.trim() || BRAND.defaultUsername;
    onUsernameChange(next);
    setTemp(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="text"
        value={temp}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setTemp(username);
            setEditing(false);
          }
        }}
        autoFocus
        maxLength={18}
        className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-900 text-xs font-semibold border border-cyan-500/50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setTemp(username);
        setEditing(true);
      }}
      className="group flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 min-w-0"
      title="Click to change name"
    >
      <span className="truncate">{username}</span>
      <Edit2 className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 shrink-0" />
    </button>
  );
}

export function Sidebar({
  theme,
  onToggleTheme,
  username,
  onUsernameChange,
  maxStreak,
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
        className={`lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl glass-panel border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 active:scale-95 transition-opacity ${
          mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop: always-visible icon rail, expands on hover */}
      <aside
        className="sidebar-desktop group/sb hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col w-[4.5rem] hover:w-64 border-r border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-[#0e0e12] shadow-[4px_0_24px_-8px_rgba(0,0,0,0.25)] transition-[width] duration-200 ease-[cubic-bezier(0.33,1,0.68,1)] overflow-hidden"
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full w-full p-3">
          <div className="sidebar-logo-wrap mb-6 shrink-0">
            <BrandLogo showTagline={false} />
          </div>

          <NavMenu showLabels />

          <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-3 shrink-0">
            <div
              className="sidebar-streak-compact w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex flex-col items-center justify-center mx-auto leading-none"
              title={`${maxStreak} day streak`}
            >
              <span className="text-sm font-black font-mono text-orange-400">{maxStreak}</span>
              <span className="text-[8px] font-bold uppercase text-orange-400/75 tracking-wide">d</span>
            </div>
            <div className="sidebar-user-expanded flex items-center justify-between gap-2 min-w-0 px-0.5">
              <UsernameChip username={username} onUsernameChange={onUsernameChange} />
              <div className="flex items-center gap-0.5 text-orange-400 font-bold text-[10px] font-mono shrink-0">
                <Flame className="w-3.5 h-3.5" />
                <span>{maxStreak}D</span>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ease-out ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onMobileClose}
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <aside
          className={`mobile-drawer absolute inset-y-2 left-2 w-[min(17.5rem,calc(100vw-1rem))] flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0e0e12] shadow-2xl shadow-black/40 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
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
              className="shrink-0 p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <nav className="space-y-1" aria-label="Main navigation">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/25'
                        : 'text-slate-600 dark:text-slate-400 active:bg-slate-100 dark:active:bg-white/[0.06]'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <footer className="p-4 pt-3 border-t border-slate-200/80 dark:border-white/10 space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
              <UsernameChip username={username} onUsernameChange={onUsernameChange} />
              <div className="flex items-center gap-1 text-orange-400 font-bold text-xs font-mono shrink-0 px-2 py-1 rounded-lg bg-orange-500/10">
                <Flame className="w-3.5 h-3.5" />
                <span>{maxStreak}D</span>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </footer>
        </aside>
      </div>
    </>
  );
}
