// src/app/api/friends/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) throw new Error('Missing BACKEND_URL');

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Friends API: Starting request...');

    const session = await getServerSession(authOptions);
    if (!session?.user.accessToken) {
      console.log('❌ Friends API: No session or access token');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('✅ Friends API: Session found, making upstream request');
    console.log('🌐 Backend URL:', BACKEND_URL);

    const { search } = new URL(req.url);
    console.log('🔗 Search params:', search);

    const upstream = await fetch(`${BACKEND_URL}/api/friends${search}`, {
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
      console.error('🚨 Upstream GET /friends error:', {
        status: upstream.status,
        statusText: upstream.statusText,
        response: text
      });
      return NextResponse.json({
        error: text || 'Upstream error',
        status: upstream.status,
        url: `${BACKEND_URL}/api/friends${search}`
      }, { status: upstream.status });
    }

    console.log('✅ Friends API: Success!');
    console.log('📊 Response length:', text.length);

    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 Friends API: Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: BACKEND_URL
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📤 Friends API POST: Starting request...');

    const session = await getServerSession(authOptions);
    if (!session?.user.accessToken) {
      console.log('❌ Friends API POST: No session or access token');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = await req.json();
      console.log('📋 Friends API POST: Payload received');
    } catch {
      console.log('❌ Friends API POST: Invalid JSON body');
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    console.log('🌐 Friends API POST: Making upstream request to:', `${BACKEND_URL}/api/friends`);

    const upstream = await fetch(`${BACKEND_URL}/api/friends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') ?? '',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error('🚨 Upstream POST /friends error:', {
        status: upstream.status,
        statusText: upstream.statusText,
        response: text
      });
      return NextResponse.json({
        error: text || 'Upstream error',
        status: upstream.status
      }, { status: upstream.status });
    }

    console.log('✅ Friends API POST: Success!');

    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 Friends API POST: Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
