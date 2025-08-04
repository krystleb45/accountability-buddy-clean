// src/app/api/anonymous-military-chat/rooms/[roomId]/members/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"

export async function GET(
  _request: NextRequest, // Prefixed with underscore to indicate intentionally unused
  { params }: { params: { roomId: string } },
) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/anonymous-military-chat/rooms/${params.roomId}/members`,
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
    console.error("Error fetching anonymous chat member count:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch member count" },
      { status: 500 },
    )
  }
}
