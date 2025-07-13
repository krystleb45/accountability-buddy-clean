// src/app/community/groups/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Groups • Accountability Buddy',
  description: 'Join groups and connect with people who share your goals and interests.',
  openGraph: {
    title: 'Groups • Accountability Buddy',
    description: 'Join groups and connect with people who share your goals and interests.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/community/groups`,
  },
};

// Dynamically load the client component
const GroupsClient = dynamic(() => import('./page.client'), { ssr: false });

export default async function GroupsPage(): Promise<ReactNode> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return <GroupsClient />;
}
