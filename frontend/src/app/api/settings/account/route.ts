// src/app/api/settings/account/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }        from 'next-auth/next';
import { authOptions }             from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) {
  throw new Error('Missing BACKEND_URL environment variable');
}

export async function DELETE(req: NextRequest) {
  // 1) Verify NextAuth session + JWT
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  // 2) Proxy to Express’s DELETE /api/settings/account
  const upstream = await fetch(`${BACKEND_URL}/api/settings/account`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
      cookie:        req.headers.get('cookie') ?? '',
    },
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('[settings/account][DELETE] upstream error:', text);
    return NextResponse.json(
      { success: false, message: text || 'Upstream error' },
      { status: upstream.status }
    );
  }

  // 3) Return backend’s JSON verbatim
  return new NextResponse(text, {
    status:  upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
