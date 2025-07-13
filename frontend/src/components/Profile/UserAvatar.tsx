// components/profile/UserAvatar.tsx
'use client';

import React from 'react';
import type { UserProfile } from '@/types/User.types';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';
import classNames from 'classnames';

type AvatarSize = 'sm' | 'md' | 'lg' | number;

interface UserAvatarProps {
  /** The user whose avatar we’re rendering */
  user: UserProfile;
  /** Pixel size (number) or preset ('sm'|'md'|'lg') */
  size?: AvatarSize;
  /** Make the avatar circle vs. slight rounding */
  rounded?: boolean;
  /** Alternative text for screen readers */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  rounded = true,
  alt,
  className,
}): JSX.Element => {
  const avatarUrl = getAvatarUrl(user);
  const initials = getInitials(user);

  const resolvedSize = typeof size === 'number' ? size : sizeMap[size];

  const style: React.CSSProperties = {
    width: `${resolvedSize}px`,
    height: `${resolvedSize}px`,
    borderRadius: rounded ? '50%' : '6px',
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={alt ?? user.fullName}
        style={style}
        className={classNames('border border-gray-500 object-cover', className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt ?? user.fullName}
      style={style}
      className={classNames(
        'flex items-center justify-center bg-gray-700 font-bold text-white',
        className,
      )}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
