// src/app/api/anonymous-military-chat/rooms/[roomId]/messages/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } },
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "50"

    const response = await fetch(
      `${BACKEND_URL}/api/anonymous-military-chat/rooms/${params.roomId}/messages?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error fetching anonymous chat messages:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 },
    )
  }
}
