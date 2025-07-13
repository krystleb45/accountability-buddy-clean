// src/app/api/feedback/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }         from 'next-auth/next';
import { authOptions }              from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!; 
// Should be "http://localhost:5050/api"

if (!BACKEND_URL) {
  throw new Error('Missing BACKEND_URL environment variable');
}

export async function GET(req: NextRequest) {
  // 1) Ensure the user is signed in
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  // 2) Forward any query string (e.g. pagination)
  const { search } = new URL(req.url);
  // 3) DO NOT add "/api" again— BACKEND_URL already is ".../api"
  const upstreamUrl = `${BACKEND_URL}/api/feedback${search}`;

  const upstream = await fetch(upstreamUrl, {
    headers: {
      'Authorization': `Bearer ${session.user.accessToken}`,
      'cookie':        req.headers.get('cookie') ?? '',
    },
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('[feedback/feed] upstream error:', text);
    return NextResponse.json(
      { success: false, message: text || 'Upstream error' },
      { status: upstream.status }
    );
  }

  return new NextResponse(text, {
    status:  upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
