import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { AccountMenu } from './AccountMenu';
import { useUserProfile } from '../../hooks/useUserProfile';

export function AccountTrigger() {
  const { profile, loading } = useUserProfile();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="account-trigger-root" ref={rootRef}>
      <button
        type="button"
        className={`account-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        disabled={loading}
      >
        <UserAvatar profile={profile} loading={loading} size="sm" />
        <span className="account-trigger-name">
          {loading ? (
            <span className="account-trigger-skeleton" aria-hidden />
          ) : (
            profile?.displayName ?? 'Account'
          )}
        </span>
        <ChevronDown className="account-trigger-chevron" strokeWidth={2} aria-hidden />
      </button>

      {open ? (
        <AccountMenu
          id={menuId}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
