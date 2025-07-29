// src/app/api/friends/online/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) throw new Error('Missing BACKEND_URL');

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { search } = new URL(req.url);
  const upstream = await fetch(`${BACKEND_URL}/api/friends/online${search}`, {
    method: 'GET',
    headers: {
      cookie: req.headers.get('cookie') ?? '',
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    cache: 'no-store',
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('🚨 Upstream GET /friends/online error:', text);
    return NextResponse.json({ error: text || 'Upstream error' }, { status: upstream.status });
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
