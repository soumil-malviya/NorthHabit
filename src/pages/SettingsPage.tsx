import { Link } from 'react-router-dom';
import {
  Bell,
  Cloud,
  Database,
  ExternalLink,
  Palette,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsRow } from '../components/settings/SettingsRow';
import { UserAvatar } from '../components/account/UserAvatar';
import { ThemeToggle } from '../components/ThemeToggle';
import { AmbientSettingsPanel } from '../components/ambient/AmbientSettingsPanel';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSyncStatus } from '../hooks/useSyncStatus';
import { useTheme } from '../hooks/useTheme';
import { useNotificationPrefs } from '../hooks/useNotificationPrefs';
import { BRAND, SEO } from '../constants/brand';

const APP_VERSION = '2.0.0';

export default function SettingsPage() {
  const { profile, loading: profileLoading } = useUserProfile();
  const { theme, toggleTheme } = useTheme();
  const { storageLabel, connectionLabel, syncLabel, syncState, isSignedIn } = useSyncStatus();
  const { prefs } = useNotificationPrefs();

  const notificationsSummary = prefs.enabled
    ? 'Reminders enabled'
    : 'Reminders disabled';

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <span className="settings-page-eyebrow">Preferences</span>
        <h1>Settings</h1>
        <p>Manage your account, appearance, and workspace preferences.</p>
      </header>

      <div className="settings-page-grid">
        <SettingsSection
          id="account"
          eyebrow="Profile"
          title="Account"
          description="Your authenticated identity from Firebase."
        >
          <div className="settings-account-card">
            <UserAvatar profile={profile} loading={profileLoading} size="lg" />
            <div className="settings-account-meta">
              <strong>{profileLoading ? 'Loading…' : profile?.displayName}</strong>
              <span>{profileLoading ? '—' : profile?.email ?? 'No email available'}</span>
            </div>
          </div>

          <div className="settings-rows">
            <SettingsRow
              label="Authentication provider"
              value={profileLoading ? '—' : profile?.providerLabel ?? 'Unknown'}
            />
            <SettingsRow
              label="Account created"
              value={profileLoading ? '—' : profile?.createdAt ?? 'Not available'}
            />
            <SettingsRow
              label="Last sign in"
              value={profileLoading ? '—' : profile?.lastSignInAt ?? 'Not available'}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          id="appearance"
          eyebrow="Display"
          title="Appearance"
          description="Control how NorthHabit looks on your device."
        >
          <div className="settings-appearance-row">
            <div className="settings-appearance-copy">
              <Palette className="settings-inline-icon" strokeWidth={1.75} />
              <div>
                <strong>Theme</strong>
                <p>Switch between light and dark modes.</p>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <div className="settings-placeholder-card">
            <Sparkles className="settings-inline-icon" strokeWidth={1.75} />
            <div>
              <strong>Custom themes</strong>
              <p>Additional theme presets will appear here in a future update.</p>
            </div>
          </div>

          <div className="settings-ambient-panel">
            <AmbientSettingsPanel theme={theme} />
          </div>
        </SettingsSection>

        <SettingsSection
          id="application"
          eyebrow="Workspace"
          title="Application"
          description="Notification and productivity preferences."
        >
          <div className="settings-rows">
            <SettingsRow
              label="Notifications"
              value={notificationsSummary}
              hint="Habit, focus, and streak reminders"
              action={
                <Link to="/app/reminders" className="settings-link-button">
                  <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Manage
                </Link>
              }
            />
          </div>

          <div className="settings-placeholder-card">
            <UserRound className="settings-inline-icon" strokeWidth={1.75} />
            <div>
              <strong>More preferences</strong>
              <p>Additional workspace controls will be added here over time.</p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          id="data"
          eyebrow="Storage"
          title="Data"
          description="Local storage and cloud sync status for your workspace."
        >
          <div className="settings-rows">
            <SettingsRow
              label="Local storage"
              value={storageLabel}
              hint="Estimated browser storage used by NorthHabit"
            />
            <SettingsRow
              label="Sync status"
              value={isSignedIn ? (syncState.isActive ? 'Active' : 'Inactive') : 'Not signed in'}
              hint="Cloud sync requires an authenticated session"
            />
            <SettingsRow
              label="Last successful sync"
              value={syncLabel}
            />
            <SettingsRow
              label="Firestore connection"
              value={
                <span className={`settings-status-pill settings-status-pill--${syncState.status}`}>
                  <Cloud className="h-3 w-3" strokeWidth={1.75} />
                  {connectionLabel}
                </span>
              }
              hint={syncState.errorMessage ?? undefined}
            />
          </div>

          <p className="settings-data-note">
            <Database className="h-3.5 w-3.5" strokeWidth={1.75} />
            Export and import controls live in the account menu for quick access.
          </p>
        </SettingsSection>

        <SettingsSection
          id="about"
          eyebrow="Product"
          title="About"
          description={`${BRAND.name} workspace information and legal links.`}
        >
          <div className="settings-rows">
            <SettingsRow label="Version" value={`v${APP_VERSION}`} />
            <SettingsRow
              label="Privacy Policy"
              value={
                <Link to="/privacy" className="settings-text-link">
                  Read policy
                  <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                </Link>
              }
            />
            <SettingsRow
              label="Terms of Service"
              value={
                <Link to="/terms" className="settings-text-link">
                  Read terms
                  <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                </Link>
              }
            />
            <SettingsRow
              label="Contact"
              value={
                <a href={`mailto:hello@${new URL(SEO.siteUrl).hostname}`} className="settings-text-link">
                  Get in touch
                  <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                </a>
              }
            />
          </div>

          <div className="settings-about-footer">
            <Shield className="h-4 w-4" strokeWidth={1.75} />
            <span>Your data stays on your device and syncs only when you are signed in.</span>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
