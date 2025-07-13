// src/app/book/page.tsx
import type { Metadata } from 'next';
import BookListClient from './page.client';

export const metadata: Metadata = {
  title: 'Book Recommendations • Accountability Buddy',
  description:
    'Discover personalized book recommendations to boost your productivity, fitness, and personal growth.',
  openGraph: {
    title: 'Book Recommendations • Accountability Buddy',
    description:
      'Discover personalized book recommendations to boost your productivity, fitness, and personal growth.',
    url: 'https://your-domain.com/book',
    siteName: 'Accountability Buddy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Recommendations • Accountability Buddy',
    description:
      'Discover personalized book recommendations to boost your productivity, fitness, and personal growth.',
  },
};

export default function BookPage() {
  // delegate all the interactivity to our client component
  return <BookListClient />;
}
