// app/unauthorized/page.tsx

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Denied – Accountability Buddy',
  description: 'You do not have permission to view this page.',
  openGraph: {
    title: 'Access Denied – Accountability Buddy',
    description: 'You do not have permission to view this page.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/unauthorized`,
  },
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-8 text-white">
      <h1 className="mb-4 text-4xl font-bold text-red-500">🚫 Access Denied</h1>
      <p className="mb-6 text-lg text-gray-300">
        You don’t have permission to view this page.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-kelly-green px-6 py-3 text-black hover:bg-green-400"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
