// src/app/api/friends/decline/route.ts
// (Create this as a separate file)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) throw new Error('Missing BACKEND_URL');

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/friends/decline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') ?? '',
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('🚨 Upstream POST /friends/decline error:', text);
    return NextResponse.json({ error: text || 'Upstream error' }, { status: upstream.status });
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
