// src/components/Challenges/ChallengeDetailPage.tsx
'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fetchChallengeById, Challenge as ApiChallenge } from '@/api/challenge/challengeApi';
import Progress from '../Progress/Progress';
import { Skeleton } from '@/components/UtilityComponents/SkeletonComponent';
import { FaCheck, FaExclamationCircle } from 'react-icons/fa';

interface Participant {
  user: string;
  progress: number;
}

const ChallengeDetailPage = (): ReactElement | null => {
  // normalize id to string
  const { id } = useParams();
  const challengeId = Array.isArray(id) ? id[0] : id;

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [challenge, setChallenge] = useState<ApiChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProgress, setUserProgress] = useState(0);

  useEffect(() => {
    if (!challengeId) return;

    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const ch = await fetchChallengeById(challengeId);
        if (!ch) {
          setError('Challenge not found.');
          return;
        }
        setChallenge(ch);

        // find this user's progress
        const part = (ch.participants as Participant[]).find((p) => p.user === userId);
        if (part) setUserProgress(part.progress);
      } catch {
        setError('Failed to load challenge details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [challengeId, userId]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-2/3 bg-gray-800" />
        <Skeleton className="h-6 w-full bg-gray-700" />
        <Skeleton className="h-6 w-full bg-gray-700" />
        <Skeleton className="h-6 w-1/2 bg-gray-700" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!challenge) {
    return <div className="p-6 text-center text-gray-400">No challenge data.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
      <h1 className="mb-2 text-3xl font-bold text-green-400">{challenge.title}</h1>
      <p className="mb-4 text-gray-300">{challenge.description}</p>

      {/* Info */}
      <div className="mb-6 space-y-1 text-sm text-gray-400">
        <p>🎯 Goal: {challenge.goal}</p>
        <p>
          🗓 {format(new Date(challenge.startDate), 'MMM d')} –{' '}
          {format(new Date(challenge.endDate), 'MMM d, yyyy')}
        </p>
        <p>👤 Created by: @{challenge.creator.username}</p>
        <p>👥 {challenge.participants.length} Participants</p>
        <p>🔐 Visibility: {challenge.visibility}</p>
      </div>

      {/* Your Progress */}
      {userProgress > 0 && (
        <div className="mb-6">
          <p className="mb-1 font-medium text-green-400">Your Progress: {userProgress}%</p>
          <Progress value={userProgress} className="h-3" />
        </div>
      )}

      {/* Milestones */}
      {challenge.milestones.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold text-white">Milestones</h2>
          <ul className="space-y-3">
            {challenge.milestones.map((m, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-2"
              >
                <div>
                  <p className="text-white">{m.title}</p>
                  <p className="text-xs text-gray-400">
                    Due: {format(new Date(m.dueDate), 'MMM d')}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    m.completed ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                  }`}
                >
                  {m.completed ? (
                    <>
                      <FaCheck className="mr-1 inline" /> Completed
                    </>
                  ) : (
                    <>
                      <FaExclamationCircle className="mr-1 inline" /> Pending
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Join/Leave */}
      {challenge.status === 'ongoing' && (
        <div className="mt-8 flex gap-4">
          <button className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-400">
            Join Challenge
          </button>
          <button className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-400">
            Leave Challenge
          </button>
        </div>
      )}
    </div>
  );
};

export default ChallengeDetailPage;
