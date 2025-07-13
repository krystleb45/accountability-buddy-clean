// example: app/api/profile/bio/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession }    from 'next-auth/next';
import { authOptions }         from '@/app/api/auth/[...nextauth]/route';

const BACKEND = process.env.BACKEND_URL!;

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Grab the JSON body
  const body = await req.json();

  const upstream = await fetch(`${BACKEND}/api/profile/bio`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // Forward both cookie *and* access token
      cookie: req.headers.get('cookie')!,
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.text();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type')! },
  });
}
