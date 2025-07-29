// src/app/api/anonymous-military-chat/rooms/[roomId]/leave/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const sessionId = request.headers.get('x-anonymous-session');
    const displayName = request.headers.get('x-anonymous-name');

    if (!sessionId || !displayName) {
      return NextResponse.json(
        { success: false, message: 'Anonymous session required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/anonymous-military-chat/rooms/${params.roomId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Anonymous-Session': sessionId,
        'X-Anonymous-Name': displayName,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error leaving anonymous chat room:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to leave room' },
      { status: 500 }
    );
  }
}
