// src/app/api/anonymous-military-chat/mood-trends/community/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function GET(_request: NextRequest) {
  try {
    console.log('[PROXY] Community Mood Trends - Forwarding to backend');

    const response = await fetch(`${BACKEND_URL}/api/anonymous-military-chat/mood-trends/community`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[PROXY] Community Mood Trends - Response status:', response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] Community Mood Trends - Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch community mood data' },
      { status: 500 }
    );
  }
}
