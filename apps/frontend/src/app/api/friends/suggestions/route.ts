// src/app/api/friends/suggestions/route.ts
export const dynamic = 'force-dynamic'; // Add this line to fix build errors

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the backend URL from environment
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5050';

    const { search } = new URL(request.url);

    console.log('🔍 Fetching friend suggestions for user:', session.user.id);

    // Forward request to Express backend - matching your existing pattern
    const response = await fetch(`${backendUrl}/api/friends/suggestions${search}`, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: 'no-store',
    });

    const text = await response.text();
    if (!response.ok) {
      console.error('🚨 Upstream GET /friends/suggestions error:', text);
      return NextResponse.json({ error: text || 'Upstream error' }, { status: response.status });
    }

    console.log('✅ Successfully fetched friend suggestions');

    return new NextResponse(text, {
      status: response.status,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in friends suggestions API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
