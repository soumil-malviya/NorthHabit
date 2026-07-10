import type { User } from 'firebase/auth';

export interface UserProfileView {
  photoURL: string | null;
  displayName: string;
  email: string | null;
  initials: string;
  providerLabel: string;
  createdAt: string | null;
  lastSignInAt: string | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  'google.com': 'Google',
  password: 'Email & password',
  'github.com': 'GitHub',
  'apple.com': 'Apple',
};

function formatAuthTimestamp(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function getUserInitials(displayName: string | null, email: string | null): string {
  const source = displayName?.trim() || email?.trim() || '';
  if (!source) return '?';

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function getProviderLabel(user: User | null): string {
  const providerId = user?.providerData?.[0]?.providerId;
  if (!providerId) return 'Unknown';
  return PROVIDER_LABELS[providerId] ?? providerId;
}

export function buildUserProfile(user: User | null): UserProfileView | null {
  if (!user) return null;

  const displayName = user.displayName?.trim() || user.email?.split('@')[0] || 'Account';
  const email = user.email ?? null;

  return {
    photoURL: user.photoURL ?? null,
    displayName,
    email,
    initials: getUserInitials(user.displayName, email),
    providerLabel: getProviderLabel(user),
    createdAt: formatAuthTimestamp(user.metadata.creationTime ?? undefined),
    lastSignInAt: formatAuthTimestamp(user.metadata.lastSignInTime ?? undefined),
  };
}
