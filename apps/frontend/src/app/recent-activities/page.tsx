// src/app/recent-activities/page.tsx
import type { Metadata } from 'next';
import RecentActivitiesClient from './page.client';

export const metadata: Metadata = {
  title: 'Recent Activities – Accountability Buddy',
  description:
    'See your most recent created and completed activities in one place.',
  openGraph: {
    title: 'Recent Activities – Accountability Buddy',
    description:
      'See your most recent created and completed activities in one place.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/recent-activities`,
  },
};

export default function Page() {
  return <RecentActivitiesClient />;
}
