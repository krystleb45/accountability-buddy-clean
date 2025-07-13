// src/app/blog/create/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Create New Blog Post • Accountability Buddy',
  description: 'Admin interface for creating a new blog post.',
};

// dynamically load the form UI
const CreateBlogClient = dynamic(
  () => import('./page.client'),
  { ssr: false }
);

export default async function CreateBlogPageWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  return <CreateBlogClient />;
}
