// src/app/api/subscription/plans/route.ts - FIXED: Single GET function with debug
// Add this line to fix build errors

import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // DEBUG: Log all headers
    console.log(
      "🔍 All request headers:",
      Object.fromEntries(request.headers.entries()),
    )

    const authHeader = request.headers.get("authorization")
    console.log("🔍 Auth header value:", authHeader)

    const accessToken = authHeader?.replace("Bearer ", "")
    console.log(
      "🔍 Extracted token:",
      accessToken ? `${accessToken.substring(0, 20)}...` : "null",
    )

    // For plans, we might not need auth since it's public info
    // But let's test with auth first to debug
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/subscription/plans`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Include auth header if we have it
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      },
    )

    console.log("🔍 Backend response status:", response.status)

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }))
      console.log("🔍 Backend error data:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log("🔍 Backend success data:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error fetching subscription plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 },
    )
  }
}
