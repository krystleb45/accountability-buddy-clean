// src/app/admin-dashboard/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

// ——— SEO Metadata —————————————————————————————————————————————
export const metadata: Metadata = {
  title: 'Admin Dashboard • Accountability Buddy',
  description: 'Overview of site metrics, recent activities, and user management.',
  openGraph: {
    title: 'Admin Dashboard • Accountability Buddy',
    description: 'Overview of site metrics, recent activities, and user management.',
    url: 'https://your-domain.com/admin-dashboard',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Admin Dashboard • Accountability Buddy',
    description: 'Overview of site metrics, recent activities, and user management.',
  },
};

// ——— Extend session.user with role —————————————————————————————————
type CustomSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

// ——— Dynamically load the client UI —————————————————————————————————
const ClientAdminDashboard = dynamic(
  () => import('./client')
);

// ——— Server wrapper with auth guard —————————————————————————————————
export default async function AdminDashboardWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions);

  // Only allow admins
  if (!session || (session.user as CustomSessionUser).role !== 'admin') {
    redirect('/unauthorized');
  }

  return <ClientAdminDashboard />;
}
