// src/components/Gamification/LeaderboardPreview.tsx
'use client';

import React, { useEffect, useState } from 'react';
import type { LeaderboardEntry } from '@/types/Gamification.types';
import { getAvatarUrl } from '@/utils/avatarUtils';

export interface UserPreview {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  rank: number;
}

export interface LeaderboardPreviewProps {
  users?: UserPreview[];
  sortBy?: 'points' | 'completedGoals' | 'streakCount';
  timeRange?: 'all' | 'weekly' | 'monthly';
  title?: string;
}

const LeaderboardPreview: React.FC<LeaderboardPreviewProps> = ({
  users,
  sortBy = 'points',
  timeRange = 'weekly',
  title,
}) => {
  const [topEntries, setTopEntries] = useState<UserPreview[]>(users ?? []);
  const [loading, setLoading] = useState<boolean>(users == null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (users) return;

    const loadTop = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/leaderboard?sortBy=${sortBy}&timeRange=${timeRange}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // normalize into an array
        const raw: LeaderboardEntry[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data?.leaderboard)
            ? json.data.leaderboard
            : Array.isArray(json.entries)
              ? json.entries
              : [];

        // take first 3
        const slice = raw.slice(0, 3);

        const mapped: UserPreview[] = slice.map((e, i) => ({
          id: e.userId,
          name: e.displayName,
          avatarUrl: getAvatarUrl(e),
          points: e.score,
          rank: i + 1,
        }));

        setTopEntries(mapped);
      } catch (err) {
        console.error('Failed to load leaderboard preview:', err);
        setError('Could not load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    loadTop();
  }, [users, sortBy, timeRange]);

  if (loading) return <p className="text-gray-400">Loading leaderboard…</p>;
  if (error)   return <p className="text-center text-red-500">{error}</p>;

  const headerTitle = title ?? '🏆 Top Performers';

  return (
    <div className="rounded-lg bg-gray-900 p-4 shadow-md">
      <h3 className="mb-3 text-lg font-semibold text-green-400">{headerTitle}</h3>
      <ul className="space-y-2">
        {topEntries.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded bg-gray-800 p-2 transition hover:bg-gray-700"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : '🥉'}
              </span>
              <img
                src={u.avatarUrl}
                alt={u.name}
                className="h-8 w-8 rounded-full border border-green-400"
              />
              <span className="font-medium text-white">{u.name}</span>
            </div>
            <span className="font-bold text-yellow-400">{u.points} XP</span>
          </li>
        ))}
      </ul>
      {/* NO inner “View Full…” link */}
    </div>
  );
};

export default LeaderboardPreview;
