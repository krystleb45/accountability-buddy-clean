// src/app/admin-reward/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Rewards • Accountability Buddy',
  description: 'Create, update, and manage platform rewards.',
  openGraph: {
    title: 'Admin Rewards • Accountability Buddy',
    description: 'Create, update, and manage platform rewards.',
    url: 'https://your-domain.com/admin-reward',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Rewards • Accountability Buddy',
    description: 'Create, update, and manage platform rewards.',
  },
};

// Dynamically import the client component
const ClientAdminRewards = dynamic(
  () => import('./client')
);

type SessionUser = { id: string; role?: string };

// Server wrapper with auth & role guard
export default async function AdminRewardsWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as SessionUser).role !== 'admin') {
    redirect('/unauthorized');
  }

  return <ClientAdminRewards />;
}
