import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND = process.env.BACKEND_URL!;

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json();
  const resp = await fetch(`${BACKEND}/api/profile/interests`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie')!,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.text();
  return new NextResponse(data, {
    status: resp.status,
    headers: { 'content-type': resp.headers.get('content-type')! },
  });
}
