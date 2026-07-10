import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { buildUserProfile } from '../lib/auth/userProfile';

export function useUserProfile() {
  const { user, loading } = useAuth();

  const profile = useMemo(() => buildUserProfile(user), [user]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
  };
}
