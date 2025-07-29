// File: app/group-recommendations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import groupService, { Group } from '@/services/groupService';
import { FaPlus, FaUsers, FaFire } from 'react-icons/fa';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Group Recommendations – Accountability Buddy',
  description: 'Discover and join trending and recommended public groups to collaborate.',
  openGraph: {
    title: 'Group Recommendations – Accountability Buddy',
    description: 'Discover and join trending and recommended public groups to collaborate.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/group-recommendations`,
  },
};

const GroupRecommendationsPage: React.FC = () => {
  const [recommendedGroups, setRecommendedGroups] = useState<Group[]>([]);
  const [trendingGroups, setTrendingGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGroups = async (): Promise<void> => {
      try {
        setLoading(true);
        const fetched = await groupService.fetchGroups();

        // Only public groups
        const publicGroups = fetched.filter((g) => !g.inviteOnly);

        // Top 5 by member count → trending
        const sortedByActivity = [...publicGroups].sort(
          (a, b) => (b.members ?? 0) - (a.members ?? 0),
        );

        setTrendingGroups(sortedByActivity.slice(0, 5));
        setRecommendedGroups(publicGroups.slice(0, 10));
      } catch {
        setError('Failed to load groups.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  const handleJoinGroup = async (groupId: string): Promise<void> => {
    try {
      await groupService.joinGroup(groupId);
      // remove from both lists
      setRecommendedGroups((prev) => prev.filter((g) => g.id !== groupId));
      setTrendingGroups((prev) => prev.filter((g) => g.id !== groupId));
    } catch {
      setError('Failed to join group.');
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6 text-center text-3xl font-bold text-green-400"
      >
        Group Recommendations
      </motion.h1>

      {error && <p className="mb-4 text-center text-red-500">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-400">Loading groups…</p>
      ) : (
        <>
          {/* Trending */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h2 className="mb-3 flex items-center justify-center gap-2 text-2xl font-semibold text-yellow-400">
              <FaFire /> Trending Groups
            </h2>
            {trendingGroups.length > 0 ? (
              <ul className="space-y-4">
                {trendingGroups.map((group) => (
                  <motion.li
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between rounded-lg bg-gray-900 p-4 shadow-lg"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <FaUsers className="text-green-400" />
                        <span className="font-semibold text-green-400">{group.name}</span>
                        <span className="text-gray-400">{group.members ?? 0} members</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">
                        {group.description ?? 'No description available.'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-white"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      <FaPlus /> Join
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400">No trending groups available.</p>
            )}
          </motion.section>

          {/* Recommended */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-3 text-center text-2xl font-semibold text-green-400">
              Suggested Groups
            </h2>
            {recommendedGroups.length > 0 ? (
              <ul className="space-y-4">
                {recommendedGroups.map((group) => (
                  <motion.li
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between rounded-lg bg-gray-900 p-4 shadow-lg"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        <FaUsers className="text-green-400" />
                        <span className="font-semibold text-green-400">{group.name}</span>
                        <span className="text-gray-400">{group.members ?? 0} members</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">
                        {group.description ?? 'No description available.'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-white"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      <FaPlus /> Join
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400">No recommended groups available.</p>
            )}
          </motion.section>
        </>
      )}
    </div>
  );
};

export default GroupRecommendationsPage;
