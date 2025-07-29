// src/app/api/anonymous-military-chat/mood-checkin/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function POST(request: NextRequest) {
  try {
    console.log('[PROXY] Mood Check-in POST - Forwarding to backend');

    const body = await request.json();
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Forward anonymous session headers
    const anonymousSession = request.headers.get('X-Anonymous-Session');
    const anonymousName = request.headers.get('X-Anonymous-Name');

    if (anonymousSession) {
      headers.set('X-Anonymous-Session', anonymousSession);
    }
    if (anonymousName) {
      headers.set('X-Anonymous-Name', anonymousName);
    }

    const response = await fetch(`${BACKEND_URL}/api/anonymous-military-chat/mood-checkin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    console.log('[PROXY] Mood Check-in POST - Response status:', response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] Mood Check-in POST - Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit mood check-in' },
      { status: 500 }
    );
  }
}
