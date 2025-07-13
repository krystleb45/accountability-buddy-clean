// src/app/leaderboard/page.tsx

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Leaderboard – Accountability Buddy',
  description: 'See the top goal achievers and try to climb the leaderboard.',
  openGraph: { /* … */ },
};

const LeaderboardClient = dynamic(() => import('./page.client'));

export default async function LeaderboardPageWrapper() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return <LeaderboardClient />;
}
