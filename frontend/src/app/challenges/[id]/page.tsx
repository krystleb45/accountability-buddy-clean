// src/app/challenge/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { fetchChallengeById, type Challenge as APIChallenge } from '@/api/challenge/challengeApi';

interface Params {
  params: { id: string };
}

// 1) Server‐only SEO metadata
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  let c: APIChallenge | null = null;
  try {
    c = await fetchChallengeById(params.id);
  } catch {
    return { title: 'Challenge not found • Accountability Buddy' };
  }
  if (!c) {
    return { title: 'Challenge not found • Accountability Buddy' };
  }
  const desc = c.description.slice(0, 150);
  return {
    title: `${c.title} • Challenge • Accountability Buddy`,
    description: desc,
    openGraph: {
      title: `${c.title} • Accountability Buddy`,
      description: desc,
      url: `https://your-domain.com/challenge/${c._id}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.title} • Accountability Buddy`,
      description: desc,
    },
  };
}

// 2) Dynamically load the client component (no SSR)
const ClientChallengeDetail = dynamic(
  () => import('./client'),
  { ssr: false }
);

// 3) Server wrapper: fetch data, then render client UI
export default async function ChallengeDetailPage({ params }: Params): Promise<ReactNode> {
  const challenge = await fetchChallengeById(params.id);
  if (!challenge) notFound();
  return <ClientChallengeDetail challenge={challenge} />;
}
