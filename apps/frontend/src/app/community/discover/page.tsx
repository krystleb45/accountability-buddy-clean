// src/app/community/discover/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Discover Friends • Accountability Buddy',
  description: 'Find new accountability partners and expand your network.',
  openGraph: {
    title: 'Discover Friends • Accountability Buddy',
    description: 'Find new accountability partners and expand your network.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/community/discover`,
  },
};

// Dynamically load the client component - REMOVED { ssr: false }
const DiscoverClient = dynamic(() => import('./client'));

export default async function DiscoverPage(): Promise<ReactNode> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return <DiscoverClient />;
}
