// src/app/create/page.tsx
import CreateForm from './page.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Goal • Accountability Buddy',
  description:
    'Set your sights on success—create and track your personal goals with Accountability Buddy.',
  openGraph: {
    title: 'Create New Goal • Accountability Buddy',
    description:
      'Set your sights on success—create and track your personal goals with Accountability Buddy.',
    url: 'https://your-domain.com/create',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create New Goal • Accountability Buddy',
    description:
      'Set your sights on success—create and track your personal goals with Accountability Buddy.',
  },
};

export default function CreatePage() {
  return <CreateForm />;
}
