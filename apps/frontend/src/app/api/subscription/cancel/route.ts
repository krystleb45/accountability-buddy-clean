// src/app/api/subscription/cancel/route.ts - FIXED: Use Authorization header
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // FIXED: Get token from Authorization header instead of cookies
    const authHeader = request.headers.get("authorization")
    const accessToken = authHeader?.replace("Bearer ", "")

    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      )
    }

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    )
  }
}
