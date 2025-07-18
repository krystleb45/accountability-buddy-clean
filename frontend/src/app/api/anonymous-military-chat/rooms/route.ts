// src/app/api/anonymous-military-chat/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function GET(_request: NextRequest) {
  try {
    console.log('[PROXY] Anonymous Chat Rooms List - Forwarding to:', `${BACKEND_URL}/api/anonymous-military-chat/rooms`);

    // ✅ CORRECT - Get list of all available rooms (no roomId parameter)
    const response = await fetch(`${BACKEND_URL}/api/anonymous-military-chat/rooms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[PROXY] Anonymous Chat Rooms List - Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Backend server error: ${response.status}`
      }));
      console.error('[PROXY] Anonymous Chat Rooms List - Error:', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log('[PROXY] Anonymous Chat Rooms List - Success:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROXY] Anonymous Chat Rooms List - Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}
