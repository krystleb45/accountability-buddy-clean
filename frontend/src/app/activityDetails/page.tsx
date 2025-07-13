// src/app/activity/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Recent Activities • Accountability Buddy',
  description: 'Track and manage your recent activities efficiently with Accountability Buddy.',
  openGraph: {
    title: 'Recent Activities • Accountability Buddy',
    description: 'Track and manage your recent activities efficiently with Accountability Buddy.',
    url: 'https://your-domain.com/activity',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Recent Activities • Accountability Buddy',
    description: 'Track and manage your recent activities efficiently with Accountability Buddy.',
  },
};

// 1) dynamically import client UI
const ClientActivityList = dynamic(
  () => import('./client'),
  { ssr: false }
);

// 2) server component to guard auth
export default async function ServerActivityList(): Promise<ReactNode> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return <ClientActivityList />;
}
