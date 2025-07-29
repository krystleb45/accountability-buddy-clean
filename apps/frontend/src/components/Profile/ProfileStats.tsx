// src/components/Profile/ProfileStats.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import styles from './Profile.module.css';
import RecentActivities from '../Activities/RecentActivities';
import RelatedActivities from '../Activities/RelatedActivities';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://api.example.com';

interface ProfileStatsProps {
  userId: string;
}

interface Stats {
  completedGoals: number;
  streak: number;
  groupsJoined: number;
  followers: number;
  following: number;
  pinnedGoals: number;
}

interface ProfileStatsResponse {
  completedGoals?: number;
  streak?: number;
  groupsJoined?: number;
  followers?: unknown[]; // adjust if you know the exact shape
  following?: unknown[];
  pinnedGoals?: unknown[];
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ userId }) => {
  const [stats, setStats] = useState<Stats>({
    completedGoals: 0,
    streak: 0,
    groupsJoined: 0,
    followers: 0,
    following: 0,
    pinnedGoals: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect((): void => {
    const fetchStats = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get<ProfileStatsResponse>(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && response.data) {
          const data = response.data;
          setStats({
            completedGoals: data.completedGoals ?? 0,
            streak: data.streak ?? 0,
            groupsJoined: data.groupsJoined ?? 0,
            followers: Array.isArray(data.followers) ? data.followers.length : 0,
            following: Array.isArray(data.following) ? data.following.length : 0,
            pinnedGoals: Array.isArray(data.pinnedGoals) ? data.pinnedGoals.length : 0,
          });
        } else {
          setError('Unexpected response from server.');
        }
      } catch (err: unknown) {
        console.error('❌ Failed to load profile stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile stats');
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <motion.div
        className="animate-pulse text-center text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Loading stats...
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.p
        className="text-center text-red-400"
        role="alert"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {error}
      </motion.p>
    );
  }

  const StatCard: React.FC<{
    label: string;
    value: number;
    onClick?: () => void;
  }> = ({ label, value, onClick }) => (
    <motion.div
      className={`rounded-lg bg-gray-800 p-4 shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={{ scale: onClick ? 1.05 : 1 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <strong className="text-xl text-green-400 sm:text-2xl">{value}</strong>
      <p className="text-sm sm:text-base">{label}</p>
    </motion.div>
  );

  return (
    <motion.div
      className={styles.profileStats}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-2xl font-bold text-green-400 sm:text-3xl">Profile Stats</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Goals Completed" value={stats.completedGoals} />
        <StatCard label="🔥 Streak" value={stats.streak} />
        <StatCard label="Groups Joined" value={stats.groupsJoined} />

        <StatCard
          label="Followers"
          value={stats.followers}
          onClick={() => console.log('Show Followers List')}
        />
        <StatCard
          label="Following"
          value={stats.following}
          onClick={() => console.log('Show Following List')}
        />
        <StatCard label="Pinned Goals" value={stats.pinnedGoals} />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-green-400 sm:text-2xl">Recent Activities</h3>
        <RecentActivities userId={userId} />

        <h3 className="mt-4 text-xl font-semibold text-green-400 sm:text-2xl">
          Related Activities
        </h3>
        <RelatedActivities userId={userId} />
      </div>
    </motion.div>
  );
};

export default ProfileStats;
