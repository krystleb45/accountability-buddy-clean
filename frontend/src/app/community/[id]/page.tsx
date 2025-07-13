// src/app/community/[id]/page.tsx
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';
import { redirect, notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { fetchCommunityById, type Community as APICommunity } from '@/api/community/communityApi';

interface Params {
  params: { id: string };
}

// 1) Server‐only SEO metadata
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  let community: APICommunity | null = null;
  try {
    community = await fetchCommunityById(params.id);
  } catch {
    return { title: 'Community Not Found • Accountability Buddy' };
  }
  if (!community) {
    return { title: 'Community Not Found • Accountability Buddy' };
  }
  return {
    title: `${community.name} • Community • Accountability Buddy`,
    description: community.description,
    openGraph: {
      title: community.name,
      description: community.description,
      url: `https://your-domain.com/community/${community._id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: community.name,
      description: community.description,
    },
  };
}

// 2) Dynamically load the client detail component (no SSR)
const ClientCommunityDetail = dynamic(() => import('./client'));

export default async function CommunityDetailPage({
  params,
}: Params): Promise<ReactNode> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const community = await fetchCommunityById(params.id);
  if (!community) {
    notFound();
  }

  return <ClientCommunityDetail community={community} />;
}
