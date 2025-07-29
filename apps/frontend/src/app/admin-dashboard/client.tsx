'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { fetchActivities } from '@/api/activity/activityApi';

// ——— Types —————————————————————————————————————————————————————
interface Activity {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  completed: boolean;
}

// ——— Component —————————————————————————————————————————————————————
export default function ClientDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setActivities(await fetchActivities());
      } catch {
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p role="status">Loading…</p>;
  if (error) return <p role="alert">{error}</p>;

  const filtered = activities.filter((a) =>
    filter === 'all' ? true : filter === 'completed' ? a.completed : !a.completed,
  );
  const sorted = [...filtered].sort((a, b) =>
    sortOrder === 'asc'
      ? +new Date(a.createdAt) - +new Date(b.createdAt)
      : +new Date(b.createdAt) - +new Date(a.createdAt),
  );

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-green-400">Admin Dashboard</h1>
        <p className="text-gray-400">Overview & recent activities</p>
      </header>

      <section className="mb-6 flex gap-4">
        <select
          aria-label="Filter activities"
          value={filter}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setFilter(e.target.value as 'all' | 'completed' | 'in-progress')
          }
          className="rounded bg-gray-700 p-2"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
        </select>

        <select
          aria-label="Sort activities"
          value={sortOrder}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSortOrder(e.target.value as 'asc' | 'desc')
          }
          className="rounded bg-gray-700 p-2"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((act) => (
          <motion.div
            key={act._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-gray-800 p-6 shadow-lg transition hover:shadow-xl"
          >
            <h3 className="text-2xl font-bold text-green-300">{act.title}</h3>
            <p className="text-gray-400">{act.description || 'No description.'}</p>
            <p className="text-sm text-gray-500">{new Date(act.createdAt).toLocaleDateString()}</p>
            <p className={act.completed ? 'text-green-400' : 'text-yellow-400'}>
              {act.completed ? 'Completed' : 'In Progress'}
            </p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
