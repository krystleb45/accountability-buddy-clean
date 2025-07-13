// src/app/messages/page.tsx

import { Suspense } from 'react'; // Add Suspense import
import type { Metadata } from 'next';
import MessagesClient from './page.client';

export const metadata: Metadata = {
  title: 'Messages • Accountability Buddy',
  description:
    'Chat with friends and groups in your accountability community. Send messages, share progress, and stay connected.',
  openGraph: {
    title: 'Messages • Accountability Buddy',
    description:
      'Chat with friends and groups in your accountability community. Send messages, share progress, and stay connected.',
    url: 'https://your-domain.com/messages',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Messages • Accountability Buddy',
    description:
      'Chat with friends and groups in your accountability community. Send messages, share progress, and stay connected.',
  },
};

export default function MessagesPage(): JSX.Element {
  // delegate all the interactivity to our client component wrapped in Suspense
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <div>Loading messages...</div>
        </div>
      </div>
    }>
      <MessagesClient />
    </Suspense>
  );
}
