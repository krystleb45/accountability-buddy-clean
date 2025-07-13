// src/app/api/settings/notifications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }        from 'next-auth/next';
import { authOptions }             from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) {
  throw new Error('Missing BACKEND_URL environment variable');
}

export async function PUT(req: NextRequest) {
  // 1) Verify NextAuth session + JWT
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  // 2) Parse client payload (Partial<{ emailNotifications, smsNotifications, pushNotifications }>)
  let clientPayload: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
  };
  try {
    clientPayload = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  // 3) Proxy to Express’s PUT /api/settings/notifications
  const upstream = await fetch(`${BACKEND_URL}/api/settings/notifications`, {
    method: 'PUT',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${session.user.accessToken}`,
      'cookie':        req.headers.get('cookie') ?? '',
    },
    body: JSON.stringify(clientPayload),
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error('[settings/notifications][PUT] upstream error:', text);
    return NextResponse.json(
      { success: false, message: text || 'Upstream error' },
      { status: upstream.status }
    );
  }

  // 4) Return backend’s JSON verbatim
  return new NextResponse(text, {
    status:  upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
