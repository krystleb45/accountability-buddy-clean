// src/app/api/anonymous-military-chat/rooms/[roomId]/join/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } },
) {
  try {
    const sessionId = request.headers.get("x-anonymous-session")
    const displayName = request.headers.get("x-anonymous-name")

    if (!sessionId || !displayName) {
      return NextResponse.json(
        { success: false, message: "Anonymous session required" },
        { status: 400 },
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/anonymous-military-chat/rooms/${params.roomId}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Anonymous-Session": sessionId,
          "X-Anonymous-Name": displayName,
        },
      },
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error joining anonymous chat room:", error)
    return NextResponse.json(
      { success: false, message: "Failed to join room" },
      { status: 500 },
    )
  }
}
