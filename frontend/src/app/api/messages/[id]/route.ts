// src/app/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { search } = new URL(req.url);
  const upstream = await fetch(`${BACKEND_URL}/api/messages/${params.id}${search}`, {
    method: 'GET',
    headers: {
      cookie: req.headers.get('cookie') ?? '',
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    cache: 'no-store',
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error(`🚨 Upstream GET /messages/${params.id} error:`, text);
    return NextResponse.json({ error: text || 'Upstream error' }, { status: upstream.status });
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.text();
  const upstream = await fetch(`${BACKEND_URL}/api/messages/${params.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie: req.headers.get('cookie') ?? '',
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body,
    cache: 'no-store',
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error(`🚨 Upstream PUT /messages/${params.id} error:`, text);
    return NextResponse.json({ error: text || 'Upstream error' }, { status: upstream.status });
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/messages/${params.id}`, {
    method: 'DELETE',
    headers: {
      cookie: req.headers.get('cookie') ?? '',
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    cache: 'no-store',
  });

  const text = await upstream.text();
  if (!upstream.ok) {
    console.error(`🚨 Upstream DELETE /messages/${params.id} error:`, text);
    return NextResponse.json({ error: text || 'Upstream error' }, { status: upstream.status });
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}
