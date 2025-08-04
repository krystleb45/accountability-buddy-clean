// src/app/api/subscription/change-plan/route.ts - FIXED: Use Authorization header
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

    const body = await request.json()

    const response = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/change-plan`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
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
    console.error("Error changing subscription plan:", error)
    return NextResponse.json(
      { error: "Failed to change subscription plan" },
      { status: 500 },
    )
  }
}
