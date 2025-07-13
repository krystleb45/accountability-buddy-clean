// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }        from 'next-auth/next';
import { authOptions }             from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;

export async function GET(req: NextRequest) {
  // 1) Check session
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // 2) Proxy to Express, forwarding cookie + Authorization
  const upstream = await fetch(`${BACKEND_URL}/api/progress`, {
    headers: {
      // forward the session cookie so authJwt can read it
      cookie:        req.headers.get('cookie') ?? '',
      // forward the JWT if your middleware prefers Authorization
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('Progress upstream error:', text);
    return new NextResponse(
      JSON.stringify({ error: 'Upstream backend error' }),
      { status: upstream.status, headers: { 'content-type': 'application/json' } }
    );
  }

  // 3) Return the JSON from Express
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
