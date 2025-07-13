// src/app/challenge/[id]/client.tsx
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

import Progress from '@/components/Progress/Progress';
import Leaderboard from '@/components/Gamification/Leaderboard';
import type {
  Challenge as APIChallenge,
  Milestone as APIMilestone,
} from '@/api/challenge/challengeApi';

interface Props {
  challenge: APIChallenge;
}

export default function ClientChallengeDetail({ challenge }: Props): JSX.Element {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const participant = challenge.participants.find((p) => p.user === userId);
  const userProgress = participant?.progress ?? 0;

  const isCreator = challenge.creator._id === userId;
  const isParticipant = challenge.participants.some((p) => p.user === userId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-0">
      <h1 className="mb-2 text-3xl font-bold text-green-400">{challenge.title}</h1>
      <p className="mb-4 text-gray-300">{challenge.description}</p>

      <div className="mb-6 space-y-2 text-sm text-gray-400">
        <p>🎯 Goal: {challenge.goal}</p>
        <p>
          🗓 {format(new Date(challenge.startDate), 'MMM d')} –{' '}
          {format(new Date(challenge.endDate), 'MMM d, yyyy')}
        </p>
        <p>👤 Created by: @{challenge.creator.username}</p>
        <p>👥 Participants: {challenge.participants.length}</p>
        <p>🔐 Visibility: {challenge.visibility}</p>
        <p>📊 Tracking: {challenge.progressTracking}</p>
      </div>

      <div className="mb-6">
        <p className="mb-1 font-medium text-green-400">Your Progress: {userProgress}%</p>
        <Progress value={userProgress} className="h-3" />
      </div>

      {challenge.milestones?.length ? (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold text-white">Milestones</h2>
          <ul className="space-y-3">
            {challenge.milestones.map((m: APIMilestone) => (
              <li
                key={m._id}
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
                  {m.completed ? 'Completed' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-semibold text-white">🏆 Challenge Leaderboard</h2>
        <Leaderboard userId={userId ?? ''} type="challenge" challengeId={challenge._id} />
      </section>

      {(isCreator || isParticipant) && (
        <div className="mt-6 flex gap-4">
          {isCreator && (
            <>
              <button className="rounded-lg bg-green-600 px-4 py-2 text-white">Edit</button>
              <button className="rounded-lg bg-red-600 px-4 py-2 text-white">Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
