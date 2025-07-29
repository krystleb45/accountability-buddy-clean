// src/app/leaderboard/page.client.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';                    // ← make sure this is here
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/types/Gamification.types';
import { fetchLeaderboard } from '@/api/leaderboard/leaderboardApi';
import LeaderboardCard from '@/components/Gamification/LeaderboardCard';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

export default function LeaderboardPage() {
  const [rows,    setRows]    = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard()
      .then(setRows)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black px-4 py-10">
      {/* ← Always render this, even if loading or no data */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-green-400 hover:underline text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {loading && (
        <LoadingSpinner size={60} />
      )}

      {error && (
        <p className="text-red-500 text-center">{error}</p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-gray-400 text-center">
          No leaderboard data available.
        </p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center text-3xl font-bold text-white"
          >
            🏆 Leaderboard – Top Goal Achievers
          </motion.h1>

          <div className="mx-auto max-w-3xl space-y-4">
            {rows.map((user, idx) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <LeaderboardCard user={user} index={idx} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
