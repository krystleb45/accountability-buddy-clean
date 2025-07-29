// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }        from 'next-auth/next';
import { authOptions }             from '@/app/api/auth/[...nextauth]/route';

const BACKEND = process.env.BACKEND_URL!;

// GET /api/profile
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND}/api/profile`, {
    headers: {
      cookie: req.headers.get('cookie')!,
      Authorization: `Bearer ${session.user.accessToken}`
    },
  });
  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type')! },
  });
}

// PUT /api/profile
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const upstream = await fetch(`${BACKEND}/api/profile`, {
    method:  'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie:          req.headers.get('cookie')!,
      Authorization:   `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type')! },
  });
}
