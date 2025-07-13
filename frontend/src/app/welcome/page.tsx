// app/welcome/page.tsx

import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome – Accountability Buddy',
  description:
    'Welcome to Accountability Buddy! Start setting your goals and connecting with accountability partners today.',
  openGraph: {
    title: 'Welcome – Accountability Buddy',
    description:
      'Welcome to Accountability Buddy! Start setting your goals and connecting with accountability partners today.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/welcome`,
  },
};

// Dynamically import the client‐only welcome UI (disable SSR)
const WelcomeClient = dynamic(() => import('./page.client'), { ssr: false });

export default function WelcomePage() {
  return <WelcomeClient />;
}
