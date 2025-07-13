import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND = process.env.BACKEND_URL!;
if (!BACKEND) throw new Error('Missing BACKEND_URL');

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { search } = new URL(req.url);
  const upstream = await fetch(`${BACKEND}/api/leaderboard${search}`, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
  });

  // forward errors
  if (!upstream.ok) {
    const text = await upstream.text();
    return NextResponse.json(
      { error: `Upstream ${upstream.status}`, details: text },
      { status: upstream.status }
    );
  }

  // backend returns { success, data: { leaderboard: [] } }
  const json = await upstream.json();
  const list = json?.data?.leaderboard;
  if (!Array.isArray(list)) {
    return NextResponse.json(
      { error: 'Malformed upstream payload', payload: json },
      { status: 502 }
    );
  }

  // **Wrap it in `{ entries: [...] }`**
  return NextResponse.json({ entries: list });
}
