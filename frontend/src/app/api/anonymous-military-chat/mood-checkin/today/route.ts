// src/app/api/anonymous-military-chat/mood-checkin/today/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function GET(request: NextRequest) {
  try {
    console.log('[PROXY] Mood Check-in Today - Forwarding to backend');

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Forward anonymous session header
    const anonymousSession = request.headers.get('X-Anonymous-Session');
    if (anonymousSession) {
      headers.set('X-Anonymous-Session', anonymousSession);
    }

    const response = await fetch(`${BACKEND_URL}/api/anonymous-military-chat/mood-checkin/today`, {
      method: 'GET',
      headers,
    });

    console.log('[PROXY] Mood Check-in Today - Response status:', response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] Mood Check-in Today - Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check mood status' },
      { status: 500 }
    );
  }
}
