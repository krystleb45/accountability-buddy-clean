// src/app/api/groups/route.ts - COMPLETE FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:5050';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('🔍 [PROXY] === DEBUGGING TOKEN FLOW ===');
    console.log('🔍 [PROXY] 1. Session exists:', !!session);
    console.log('🔍 [PROXY] 2. Session user:', session?.user);
    console.log('🔍 [PROXY] 3. Full session object:', JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.log('❌ [PROXY] No session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check different ways the token might be stored
    const tokenOption1 = (session as any).accessToken;
    const tokenOption2 = (session.user as any).accessToken;
    const tokenOption3 = session.user?.accessToken;
    const tokenOption4 = (session as any).access_token;

    console.log('🔍 [PROXY] 4. Token option 1 (session.accessToken):', !!tokenOption1);
    console.log('🔍 [PROXY] 5. Token option 2 (session.user.accessToken):', !!tokenOption2);
    console.log('🔍 [PROXY] 6. Token option 3 (session.user?.accessToken):', !!tokenOption3);
    console.log('🔍 [PROXY] 7. Token option 4 (session.access_token):', !!tokenOption4);

    const accessToken = tokenOption2 || tokenOption1 || tokenOption3 || tokenOption4;
    console.log('🔍 [PROXY] 8. Final token selected:', !!accessToken);
    console.log('🔍 [PROXY] 9. Token preview:', accessToken ? accessToken.substring(0, 30) + '...' : 'NONE');

    if (!accessToken) {
      console.log('❌ [PROXY] No access token found in any location');
      console.log('🔍 [PROXY] Available session keys:', Object.keys(session));
      console.log('🔍 [PROXY] Available user keys:', Object.keys(session.user || {}));
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    // Forward query parameters to Express backend
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const expressUrl = `${EXPRESS_API_URL}/api/groups${queryString ? `?${queryString}` : ''}`;

    console.log(`🚀 [PROXY] GET ${expressUrl}`);
    console.log('🔑 [PROXY] Using token:', accessToken.substring(0, 20) + '...');

    const response = await fetch(expressUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📥 [PROXY] Express responded with status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`
      }));
      console.error(`❌ [PROXY ERROR] ${response.status}:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log(`✅ [PROXY SUCCESS] Retrieved groups data:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 [PROXY ERROR] Error proxying groups GET request:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('🔍 [PROXY DEBUG] POST - Session exists:', !!session);
    console.log('🔍 [PROXY DEBUG] POST - User ID:', session?.user?.id);

    if (!session?.user?.id) {
      console.log('❌ [PROXY] POST - No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check multiple token locations
    const accessToken = (session.user as any).accessToken ||
                       (session as any).accessToken ||
                       (session as any).access_token;

    console.log('🔍 [PROXY DEBUG] POST - Access Token exists:', !!accessToken);

    if (!accessToken) {
      console.log('❌ [PROXY] POST - No access token found');
      console.log('🔍 [PROXY] Available session keys:', Object.keys(session));
      console.log('🔍 [PROXY] Available user keys:', Object.keys(session.user || {}));
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const body = await request.json();
    const expressUrl = `${EXPRESS_API_URL}/api/groups`;

    console.log(`🚀 [PROXY] POST ${expressUrl}`, {
      name: body.name,
      category: body.category
    });
    console.log('🔑 [PROXY] Using token:', accessToken.substring(0, 20) + '...');

    const response = await fetch(expressUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`📥 [PROXY] Express POST responded with status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`
      }));
      console.error(`❌ [PROXY ERROR] ${response.status}:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log(`✅ [PROXY SUCCESS] Created group:`, data);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('💥 [PROXY ERROR] Error proxying create group request:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
