// src/components/BadgeSystem/BadgeList.tsx
'use client';

import React, { useState, FC } from 'react';
import BadgeItem from './BadgeItem';
import type { Badge } from '@/types/Gamification.types';

export interface BadgeListProps {
  badges: (Badge & { isEarned: boolean; dateEarned?: string })[];
  onBadgeClick: (id: string) => void;
}

const CATEGORIES = ['All', 'Streak', 'Milestone', 'Community'] as const;
type Category = (typeof CATEGORIES)[number];

const BadgeList: FC<BadgeListProps> = ({ badges, onBadgeClick }) => {
  const [activeTab, setActiveTab] = useState<Category>('All');

  if (badges.length === 0) {
    return <p className="text-center text-gray-400">No badges to display.</p>;
  }

  const filtered =
    activeTab === 'All'
      ? badges
      : badges.filter((b) => b.category?.toLowerCase() === activeTab.toLowerCase());

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex justify-center gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveTab(cat)}
            className={`rounded-full px-4 py-2 font-semibold transition ${
              activeTab === cat
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} onClick={onBadgeClick} />
        ))}
      </div>
    </div>
  );
};

export default BadgeList;
