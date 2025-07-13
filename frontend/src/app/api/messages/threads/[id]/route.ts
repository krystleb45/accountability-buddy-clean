// src/app/api/messages/threads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) throw new Error('Missing BACKEND_URL');

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    console.log(`🔍 Thread ${params.id} API GET: Starting request...`);

    const session = await getServerSession(authOptions);
    if (!session?.user?.accessToken) {
      console.log(`❌ Thread ${params.id} API GET: No session or access token`);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { search } = new URL(req.url);
    console.log(`🔗 Thread ${params.id} API GET: Search params:`, search);
    console.log(`🌐 Thread ${params.id} API GET: Backend URL:`, `${BACKEND_URL}/api/messages/threads/${params.id}${search}`);

    const upstream = await fetch(`${BACKEND_URL}/api/messages/threads/${params.id}${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') ?? '',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: 'no-store',
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error(`🚨 Upstream GET /messages/threads/${params.id} error:`, {
        status: upstream.status,
        statusText: upstream.statusText,
        response: text,
        url: `${BACKEND_URL}/api/messages/threads/${params.id}${search}`
      });
      return NextResponse.json({
        error: text || 'Failed to fetch thread messages',
        status: upstream.status,
        threadId: params.id
      }, { status: upstream.status });
    }

    console.log(`✅ Thread ${params.id} API GET: Success!`);
    console.log('📊 Response length:', text.length);

    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    });

  } catch (error) {
    console.error(`🚨 Thread ${params.id} API GET: Unexpected error:`, error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      threadId: params.id
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    console.log(`📤 Thread ${params.id} API PUT: Starting request...`);

    const session = await getServerSession(authOptions);
    if (!session?.user?.accessToken) {
      console.log(`❌ Thread ${params.id} API PUT: No session or access token`);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.text();
    console.log(`📋 Thread ${params.id} API PUT: Body length:`, body.length);

    const upstream = await fetch(`${BACKEND_URL}/api/messages/threads/${params.id}`, {
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
      console.error(`🚨 Upstream PUT /messages/threads/${params.id} error:`, {
        status: upstream.status,
        statusText: upstream.statusText,
        response: text
      });
      return NextResponse.json({
        error: text || 'Failed to update thread',
        status: upstream.status,
        threadId: params.id
      }, { status: upstream.status });
    }

    console.log(`✅ Thread ${params.id} API PUT: Success!`);

    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    });

  } catch (error) {
    console.error(`🚨 Thread ${params.id} API PUT: Unexpected error:`, error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      threadId: params.id
    }, { status: 500 });
  }
}
