// src/app/api/subscription/limits/route.ts - FIXED: Use Authorization header

// Add this line to fix build errors

import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
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
      `${process.env.BACKEND_URL}/api/subscription/limits`,
      {
        method: "GET",
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
    console.error("Error fetching user limits:", error)
    return NextResponse.json(
      { error: "Failed to fetch user limits" },
      { status: 500 },
    )
  }
}
