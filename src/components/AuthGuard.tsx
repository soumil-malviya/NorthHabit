import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginModal } from './LoginModal';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <LoginModal />;
  }

  return <>{children}</>;
}
