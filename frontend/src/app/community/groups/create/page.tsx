// src/app/community/groups/create/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Create Group • Accountability Buddy',
  description: 'Create a new group to connect with like-minded people and achieve your goals together.',
  openGraph: {
    title: 'Create Group • Accountability Buddy',
    description: 'Create a new group to connect with like-minded people and achieve your goals together.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/community/groups/create`,
  },
};

// Dynamically load the client component - REMOVED kept loading
const CreateGroupClient = dynamic(() => import('./client'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  )
});

export default async function CreateGroupPage(): Promise<ReactNode> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return <CreateGroupClient />;
}
