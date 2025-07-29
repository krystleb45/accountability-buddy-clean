// src/app/activity/client.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchActivities } from '@/api/activity/activityApi';

interface Activity {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  completed: boolean;
}

export default function ClientActivityList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState({ title: '', description: '' });
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchActivities()
      .then((data) => setActivities(data))
      .catch((err) => {
        console.error(err);
        setError('Failed to load activities. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    const title = newActivity.title.trim();
    if (!title) return;
    const entry: Activity = {
      _id: Math.random().toString(36).substr(2),
      title,
      description: newActivity.description,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setActivities((a) => [entry, ...a]);
    setNewActivity({ title: '', description: '' });
  };

  const handleComplete = (id: string) =>
    setActivities((a) => a.map((act) => (act._id === id ? { ...act, completed: true } : act)));

  const filtered = activities.filter((act) =>
    filter === 'all' ? true : filter === 'completed' ? act.completed : !act.completed,
  );
  const sorted = [...filtered].sort((a, b) =>
    sortOrder === 'asc'
      ? +new Date(a.createdAt) - +new Date(b.createdAt)
      : +new Date(b.createdAt) - +new Date(a.createdAt),
  );

  if (loading) {
    return (
      <main role="status" className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-gray-400">Loading activities…</p>
      </main>
    );
  }
  if (error) {
    return (
      <main role="alert" className="flex min-h-screen items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-gray-400">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-6xl"
      >
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-green-400">Recent Activities</h1>
          <p className="text-gray-400">Track and manage your activities efficiently.</p>
        </header>

        {/* Controls */}
        <section className="mb-6 flex flex-col gap-4 md:flex-row md:justify-between">
          <select
            aria-label="Filter activities"
            className="rounded bg-gray-700 p-2 text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'in-progress')}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
          </select>
          <select
            aria-label="Sort activities"
            className="rounded bg-gray-700 p-2 text-white"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </section>

        {/* Add Activity */}
        <section
          aria-labelledby="add-activity-heading"
          className="mb-8 rounded-lg bg-gray-800 p-6 shadow-lg"
        >
          <h2 id="add-activity-heading" className="mb-4 text-xl font-semibold text-green-400">
            Add New Activity
          </h2>
          <input
            aria-label="Activity title"
            type="text"
            placeholder="Title"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            className="mb-3 w-full rounded bg-gray-700 p-2 text-white"
          />
          <textarea
            aria-label="Activity description"
            placeholder="Description"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            className="mb-3 w-full rounded bg-gray-700 p-2 text-white"
          />
          <button
            onClick={handleCreate}
            className="w-full rounded-lg bg-green-500 px-4 py-2 transition hover:bg-green-400"
          >
            Add Activity
          </button>
        </section>

        {/* List */}
        <section
          aria-labelledby="activities-list-heading"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <h2 id="activities-list-heading" className="sr-only">
            Activities List
          </h2>
          {sorted.map((activity) => (
            <motion.div
              key={activity._id}
              className="transform rounded-lg bg-gray-800 p-6 shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-2xl font-bold text-green-300">{activity.title}</h3>
              <p className="text-gray-400">{activity.description || 'No description available.'}</p>
              <p className="text-sm text-gray-500">
                Created on: {new Date(activity.createdAt).toLocaleDateString()}
              </p>
              <p
                className={`mt-1 text-sm ${
                  activity.completed ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                {activity.completed ? 'Completed' : 'In Progress'}
              </p>
              {!activity.completed && (
                <button
                  onClick={() => handleComplete(activity._id)}
                  className="mt-4 w-full rounded-lg bg-blue-500 px-4 py-2 transition hover:bg-blue-400"
                >
                  Mark as Complete
                </button>
              )}
            </motion.div>
          ))}
        </section>
      </motion.div>
    </main>
  );
}
