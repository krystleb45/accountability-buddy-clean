// src/app/api/groups/[groupId]/route.ts - CLEAN VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:5050';

export async function GET(_request: NextRequest, { params }: { params: { groupId: string } }) {
  console.log('[PROXY] Group detail route hit for groupId:', params.groupId);

  try {
    const session = await getServerSession(authOptions);
    console.log('[PROXY] Session exists:', !!session);
    console.log('[PROXY] User ID:', session?.user?.id);

    if (!session?.user?.id) {
      console.log('[PROXY] No session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check multiple token locations (same as your working route)
    const accessToken = (session.user as any).accessToken ||
                       (session as any).accessToken ||
                       (session as any).access_token;

    console.log('[PROXY] Access Token exists:', !!accessToken);

    if (!accessToken) {
      console.log('[PROXY] No access token found');
      console.log('[PROXY] Available session keys:', Object.keys(session));
      console.log('[PROXY] Available user keys:', Object.keys(session.user || {}));
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const { groupId } = params;
    const expressUrl = `${EXPRESS_API_URL}/api/groups/${groupId}`;

    console.log(`[PROXY] Fetching from Express: ${expressUrl}`);
    console.log('[PROXY] Using token:', accessToken.substring(0, 20) + '...');

    const response = await fetch(expressUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[PROXY] Express responded with status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`
      }));
      console.error(`[PROXY] Express error:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log(`[PROXY] Success! Retrieved group data:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY] Error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { groupId: string } }) {
  console.log('[PROXY] Group detail PUT request received');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = (session.user as any).accessToken ||
                       (session as any).accessToken ||
                       (session as any).access_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const { groupId } = params;
    const body = await request.json();
    const expressUrl = `${EXPRESS_API_URL}/api/groups/${groupId}`;

    const response = await fetch(expressUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY PUT] Error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { groupId: string } }) {
  console.log('[PROXY] Group detail DELETE request received');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = (session.user as any).accessToken ||
                       (session as any).accessToken ||
                       (session as any).access_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const { groupId } = params;
    const expressUrl = `${EXPRESS_API_URL}/api/groups/${groupId}`;

    const response = await fetch(expressUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`
      }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY DELETE] Error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}
