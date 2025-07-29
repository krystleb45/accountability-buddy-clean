// src/app/activityDetails/[id]/client.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Activity as APIActivity } from '@/api/activity/activityApi';
import { fetchActivityById } from '@/api/activity/activityApi';

interface ClientProps {
  id: string;
}

export default function ClientActivityDetail({ id }: ClientProps) {
  const [activity, setActivity] = useState<APIActivity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      setError('No activity ID provided.');
      setLoading(false);
      return;
    }

    fetchActivityById(id)
      .then((data) => {
        if (!data) {
          setError('Activity not found.');
        } else {
          setActivity(data);
        }
      })
      .catch(() => setError('Failed to load activity details.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-gray-900 p-6 text-white shadow-lg">
      <h1
        id="activity-details-heading"
        className="mb-4 text-center text-3xl font-bold text-green-400"
      >
        📌 Activity Details
      </h1>

      {loading && (
        <div role="status" className="animate-pulse text-center text-gray-400">
          Loading activity details...
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="text-center text-red-500">
          {error}
        </div>
      )}

      {activity && !loading && !error && (
        <section
          aria-labelledby="activity-details-heading"
          className="rounded-lg bg-gray-800 p-5 shadow-md"
        >
          <h2 className="mb-2 text-xl font-semibold text-green-300">{activity.title}</h2>

          {activity.description && (
            <p className="mt-2">
              <strong className="text-green-400">Description:</strong> {activity.description}
            </p>
          )}

          <p className="mt-2">
            <strong className="text-green-400">Created At:</strong>{' '}
            {new Date(activity.createdAt).toLocaleString()}
          </p>

          <p className="mt-4">
            <strong className="text-green-400">Completed:</strong>{' '}
            {activity.completed ? 'Yes' : 'No'}
          </p>

          <p className="mt-2">
            <strong className="text-green-400">👍 Likes:</strong> {activity.likes}
          </p>

          <p className="mt-2">
            <strong className="text-green-400">💬 Comments:</strong> {activity.comments.length}
          </p>
        </section>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => router.back()}
          className="rounded-lg bg-green-500 px-6 py-2 font-semibold text-black transition hover:bg-green-400"
        >
          ⬅ Back to Activity Feed
        </button>
      </div>
    </div>
  );
}
