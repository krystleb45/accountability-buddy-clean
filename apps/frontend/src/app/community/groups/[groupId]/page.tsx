// src/app/community/groups/[groupId]/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

interface Params {
  params: { groupId: string };
}

export async function generateMetadata({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params; // ✅ Await params first
  return {
    title: `Group Chat • Accountability Buddy`,
    description: 'Chat with your group members and stay accountable together.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/community/groups/${groupId}`, // ✅
  };
}

// Dynamically load the client component - REMOVED { ssr: false }
const GroupDetailClient = dynamic(() => import('./client'));

export default async function GroupDetailPage({ params: _params }: Params): Promise<ReactNode> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  // Don't pass groupId as prop - let the client component get it from useParams()
  return <GroupDetailClient />;
}
