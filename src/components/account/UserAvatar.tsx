import type { UserProfileView } from '../../lib/auth/userProfile';

type UserAvatarSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<UserAvatarSize, { box: string; text: string }> = {
  sm: { box: 'h-7 w-7 text-[10px]', text: 'text-[10px]' },
  md: { box: 'h-10 w-10 text-sm', text: 'text-sm' },
  lg: { box: 'h-14 w-14 text-lg', text: 'text-lg' },
};

interface UserAvatarProps {
  profile: UserProfileView | null;
  loading?: boolean;
  size?: UserAvatarSize;
  className?: string;
}

export function UserAvatar({
  profile,
  loading = false,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const sizeClass = SIZE_MAP[size];

  if (loading) {
    return (
      <span
        className={`user-avatar user-avatar--skeleton ${sizeClass.box} ${className}`}
        aria-hidden
      />
    );
  }

  if (profile?.photoURL) {
    return (
      <img
        src={profile.photoURL}
        alt=""
        className={`user-avatar user-avatar--photo ${sizeClass.box} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      className={`user-avatar user-avatar--initials ${sizeClass.box} ${sizeClass.text} ${className}`}
      aria-hidden
    >
      {profile?.initials ?? '?'}
    </span>
  );
}
