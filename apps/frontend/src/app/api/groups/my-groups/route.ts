// src/app/api/groups/my-groups/route.ts - COMPLETE VERSION

export const dynamic = 'force-dynamic'; // Add this line to fix build errors

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('🔍 [MY GROUPS PROXY] Session exists:', !!session);
    console.log('🔍 [MY GROUPS PROXY] User ID:', session?.user?.id);

    if (!session?.user?.id) {
      console.log('❌ [MY GROUPS PROXY] No session - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check multiple token locations
    const accessToken = (session.user as any).accessToken ||
                       (session as any).accessToken ||
                       (session as any).access_token;

    console.log('🔍 [MY GROUPS PROXY] Access Token exists:', !!accessToken);

    if (!accessToken) {
      console.log('❌ [MY GROUPS PROXY] No access token found');
      console.log('🔍 [MY GROUPS PROXY] Available session keys:', Object.keys(session));
      console.log('🔍 [MY GROUPS PROXY] Available user keys:', Object.keys(session.user || {}));
      return NextResponse.json({ error: 'No access token available' }, { status: 401 });
    }

    const backendUrl = `${BACKEND_URL}/api/groups/my-groups`;

    console.log(`🚀 [MY GROUPS PROXY] GET ${backendUrl}`);
    console.log('🔑 [MY GROUPS PROXY] Using token:', accessToken.substring(0, 20) + '...');

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📥 [MY GROUPS PROXY] Express responded with status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`
      }));
      console.error(`❌ [MY GROUPS PROXY ERROR] ${response.status}:`, errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log(`✅ [MY GROUPS PROXY SUCCESS] Retrieved my groups:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('💥 [MY GROUPS PROXY ERROR] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch my groups' }, { status: 500 });
  }
}
