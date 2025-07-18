// src/app/api/anonymous-military-chat/mood-trends/history/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function GET(request: NextRequest) {
  try {
    console.log('[PROXY] Mood Trends History - Forwarding to backend');

    // Forward query parameters (like ?days=7)
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/anonymous-military-chat/mood-trends/history${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[PROXY] Mood Trends History - Response status:', response.status);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[PROXY] Mood Trends History - Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch mood trends' },
      { status: 500 }
    );
  }
}
