// src/app/dashboard/page.tsx - Fixed
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard • Accountability Buddy',
  description:
    'Your personalized dashboard: track your goals, celebrate achievements, and engage with the community.',
  openGraph: {
    title: 'Dashboard • Accountability Buddy',
    description:
      'Your personalized dashboard: track your goals, celebrate achievements, and engage with the community.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard • Accountability Buddy',
    description:
      'Your personalized dashboard: track your goals, celebrate achievements, and engage with the community.',
  },
};

// Remove the DashboardClientProps import and generic type since the component doesn't accept props
const DashboardClient = dynamicImport(
  () => import('./page.client').then((mod) => mod.default)
);

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  // Just render the component without props since it gets data from useSession hook
  return <DashboardClient />;
}
