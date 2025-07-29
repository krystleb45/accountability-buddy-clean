// src/app/api/military-support/resources/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function GET(_request: NextRequest) {
  try {
    console.log('[PROXY] Military Support Resources - Forwarding to:', `${BACKEND_URL}/api/military-support/resources`);

    const response = await fetch(`${BACKEND_URL}/api/military-support/resources`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[PROXY] Military Support Resources - Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Backend server error: ${response.status}`
      }));
      console.error('[PROXY] Military Support Resources - Error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[PROXY] Military Support Resources - Success:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY] Military Support Resources - Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
