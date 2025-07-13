// src/app/error/page.tsx
import { Suspense } from 'react'; // Add Suspense import
import ErrorClient from './page.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Error • Accountability Buddy',
  description: 'An unexpected error occurred. Please try again or return to the homepage.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Error • Accountability Buddy',
    description:
      'An unexpected error occurred on Accountability Buddy. Please try again or return to the homepage.',
    url: 'https://your-domain.com/error',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Error • Accountability Buddy',
    description:
      'An unexpected error occurred on Accountability Buddy. Please try again or return to the homepage.',
  },
};

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading...</div></div>}>
      <ErrorClient />
    </Suspense>
  );
}
