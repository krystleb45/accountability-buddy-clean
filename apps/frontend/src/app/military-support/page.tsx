// 3. UNCHANGED: src/app/military-support/page.tsx (this looks good as-is)
import type { Metadata } from 'next';
import MilitarySupportPageClient from './page.client';

export const metadata: Metadata = {
  title: 'Military Support – Accountability Buddy',
  description: 'Free military support resources and crisis help for active duty and veterans.',
  openGraph: {
    title: 'Military Support – Accountability Buddy',
    description: 'Free military support resources and crisis help for active duty and veterans.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/military-support`,
  },
};

export default async function MilitarySupportPage() {
  // REMOVED: Authentication check - this page is free for everyone
  // Military support should be accessible without requiring login

  return <MilitarySupportPageClient />;
}
