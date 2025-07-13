'use client';

import React, { useEffect, useState } from 'react';
import GamificationService from '@/services/gamificationService';
import BadgeList from '@/components/BadgeSystem/BadgeList';
import type { Badge } from '@/types/Gamification.types';

export default function ClientBadgePage(): React.JSX.Element {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges(): Promise<void> {
      try {
        setLoading(true);
        const badgeData = await GamificationService.fetchBadges();
        setBadges(badgeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchBadges();
  }, []);

  const earnedBadges = badges.filter((b) => b.isEarned);
  const lockedBadges = badges.filter((b) => !b.isEarned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 px-6 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">Your Badges</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading badges...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          {earnedBadges.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">Unlocked</h2>
              <BadgeList
                badges={earnedBadges}
                onBadgeClick={() => {
                  /* no-op */
                }}
              />
            </section>
          )}

          {lockedBadges.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold text-gray-500">Locked</h2>
              <BadgeList
                badges={lockedBadges}
                onBadgeClick={() => {
                  /* no-op */
                }}
              />
            </section>
          )}

          {earnedBadges.length === 0 && lockedBadges.length === 0 && (
            <p className="text-center text-gray-500">No badges available yet.</p>
          )}
        </>
      )}
    </div>
  );
}
