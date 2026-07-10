import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, LogOut, Settings, Upload } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { ImportConfirmDialog } from '../data/ImportConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useDataPortability } from '../../hooks/useDataPortability';

interface AccountMenuProps {
  id: string;
  onClose: () => void;
}

export function AccountMenu({ id, onClose }: AccountMenuProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, loading } = useUserProfile();
  const {
    inputRef,
    pendingImport,
    warnings,
    exportData,
    handleImportFile,
    confirmImport,
    cancelImport,
    openFilePicker,
  } = useDataPortability();
  const signingOutRef = useRef(false);

  const openSettings = () => {
    onClose();
    navigate('/app/settings');
  };

  const handleExport = () => {
    exportData();
    onClose();
  };

  const handleSignOut = async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    onClose();
    try {
      await signOut();
      navigate('/');
    } finally {
      signingOutRef.current = false;
    }
  };

  return (
    <>
      <div className="account-menu" role="menu" id={id} aria-label="Account menu">
        <div className="account-menu-header">
          <UserAvatar profile={profile} loading={loading} size="lg" />
          <div className="account-menu-identity">
            <p className="account-menu-name">
              {loading ? <span className="account-menu-skeleton account-menu-skeleton--title" /> : profile?.displayName}
            </p>
            <p className="account-menu-email">
              {loading ? <span className="account-menu-skeleton account-menu-skeleton--subtitle" /> : profile?.email ?? 'No email available'}
            </p>
            <span className="account-menu-badge">Signed in with {profile?.providerLabel ?? 'Google'}</span>
          </div>
        </div>

        <div className="account-menu-divider" role="separator" />

        <div className="account-menu-actions">
          <button type="button" className="account-menu-item" role="menuitem" onClick={openSettings}>
            <Settings className="account-menu-item-icon" strokeWidth={1.75} />
            Open Settings
          </button>
          <button type="button" className="account-menu-item" role="menuitem" onClick={handleExport}>
            <Download className="account-menu-item-icon" strokeWidth={1.75} />
            Export Data
          </button>
          <button type="button" className="account-menu-item" role="menuitem" onClick={openFilePicker}>
            <Upload className="account-menu-item-icon" strokeWidth={1.75} />
            Import Data
          </button>
          <button
            type="button"
            className="account-menu-item account-menu-item--danger"
            role="menuitem"
            onClick={() => void handleSignOut()}
          >
            <LogOut className="account-menu-item-icon" strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => void handleImportFile(event.target.files?.[0])}
      />

      {pendingImport ? (
        <ImportConfirmDialog
          warnings={warnings}
          onConfirm={confirmImport}
          onCancel={cancelImport}
        />
      ) : null}
    </>
  );
}
