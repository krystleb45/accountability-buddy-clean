// src/app/api/military-support/disclaimer/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"

export async function GET(_request: NextRequest) {
  try {
    console.log(
      "[PROXY] Military Support Disclaimer - Forwarding to:",
      `${BACKEND_URL}/api/military-support/disclaimer`,
    )

    const response = await fetch(
      `${BACKEND_URL}/api/military-support/disclaimer`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    console.log(
      "[PROXY] Military Support Disclaimer - Response status:",
      response.status,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Backend server error: ${response.status}`,
      }))
      console.error("[PROXY] Military Support Disclaimer - Error:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log("[PROXY] Military Support Disclaimer - Success:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[PROXY] Military Support Disclaimer - Error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch disclaimer" },
      { status: 500 },
    )
  }
}
