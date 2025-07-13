// src/app/logout/page.tsx
import LogoutClient from './page.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logging Out – Accountability Buddy',
  description: 'You are being logged out of your Accountability Buddy account.',
  openGraph: {
    title: 'Logging Out – Accountability Buddy',
    description: 'You are being logged out of your Accountability Buddy account.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/logout`,
  },
};

export default function LogoutPage() {
  return <LogoutClient />;
}
