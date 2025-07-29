// src/components/BadgeSystem/BadgeItem.tsx
'use client';

import React from 'react';
import type { Badge } from '@/types/Gamification.types';
import clsx from 'clsx';

export interface BadgeItemProps {
  badge: Badge & { isEarned: boolean; dateEarned?: string };
  onClick?: (id: string) => void;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, onClick }) => {
  const { id, name, imageUrl, isEarned, dateEarned } = badge;

  const handleClick = (): void => {
    if (isEarned && onClick) onClick(id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isEarned}
      aria-label={`Badge: ${name}${isEarned && dateEarned ? `, earned on ${new Date(dateEarned).toLocaleDateString()}` : ''}`}
      className={clsx(
        'flex transform flex-col items-center justify-center rounded-xl border p-4 shadow-sm transition-transform',
        'focus:outline-none focus:ring-2 focus:ring-kelly-green focus:ring-offset-2',
        'hover:scale-105',
        {
          'cursor-pointer border-green-400 bg-white': isEarned,
          'cursor-not-allowed border-gray-300 bg-gray-100 opacity-60': !isEarned,
        },
      )}
    >
      <img
        src={imageUrl || '/placeholder-badge.png'}
        alt={`${name} badge icon`}
        className="mb-2 h-16 w-16 object-contain"
        aria-hidden="true"
      />
      <h3 className="text-md text-center font-semibold">{name}</h3>
      {isEarned ? (
        dateEarned && (
          <p className="mt-1 text-sm text-green-700">
            Earned on: {new Date(dateEarned).toLocaleDateString()}
          </p>
        )
      ) : (
        <p className="mt-1 text-sm text-gray-500">Not earned yet</p>
      )}
    </button>
  );
};

export default React.memo(BadgeItem);
