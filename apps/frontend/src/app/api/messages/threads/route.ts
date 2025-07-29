// src/app/api/messages/threads/route.ts
export const dynamic = 'force-dynamic'; // Add this line to fix build errors

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL!;
if (!BACKEND_URL) throw new Error('Missing BACKEND_URL');

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Message Threads API: Starting request...');

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('❌ Message Threads API: No session');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get accessToken from session (handle both possible structures)
    const accessToken = (session.user as any)?.accessToken;
    if (!accessToken) {
      console.log('❌ Message Threads API: No access token in session');
      console.log('📋 Session user keys:', Object.keys(session.user));
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('✅ Message Threads API: Session found');
    console.log('👤 User ID:', (session.user as any)?.id || session.user.email);
    console.log('🔑 Token preview:', accessToken.substring(0, 20) + '...');

    const { search } = new URL(req.url);
    const backendUrl = `${BACKEND_URL}/api/messages/threads${search}`;

    console.log('🔗 Search params:', search);
    console.log('🌐 Backend URL:', backendUrl);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'cookie': req.headers.get('cookie') ?? '',
    };

    console.log('📤 Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
      'cookie': headers.cookie ? 'Present' : 'Missing'
    });

    const upstream = await fetch(backendUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      console.error('🚨 Upstream GET /messages/threads error:', {
        status: upstream.status,
        statusText: upstream.statusText,
        url: backendUrl,
        response: text.substring(0, 500) // Log first 500 chars to avoid spam
      });

      return NextResponse.json({
        error: text || 'Failed to fetch message threads',
        status: upstream.status,
        url: backendUrl
      }, { status: upstream.status });
    }

    console.log('✅ Message Threads API: Success!');
    console.log('📊 Response length:', text.length);

    // Try to parse the response to see what we got
    try {
      const parsed = JSON.parse(text);
      console.log('📋 Response structure:', {
        isArray: Array.isArray(parsed),
        length: Array.isArray(parsed) ? parsed.length : 'N/A',
        keys: typeof parsed === 'object' ? Object.keys(parsed) : 'N/A'
      });
    } catch (e) {
      console.log('⚠️ Could not parse response as JSON');
    }

    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    });

  } catch (error) {
    console.error('🚨 Message Threads API: Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: BACKEND_URL
    }, { status: 500 });
  }
}
