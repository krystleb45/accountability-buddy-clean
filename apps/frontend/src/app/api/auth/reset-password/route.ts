// src/app/api/auth/reset-password/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface ResetPasswordRequest {
  token: string
  password: string
}
interface ErrorResponse {
  success: false
  message: string
}
interface SuccessResponse {
  success: true
  message: string
}

if (!process.env.BACKEND_URL) {
  throw new Error("Missing BACKEND_URL environment variable")
}
const BACKEND_URL = process.env.BACKEND_URL

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 */
export async function POST(
  req: NextRequest,
): Promise<NextResponse<SuccessResponse> | NextResponse<ErrorResponse>> {
  // 1) parse & validate JSON
  let body: Partial<ResetPasswordRequest>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 },
    )
  }

  const { token, password } = body
  if (!token || !password) {
    return NextResponse.json(
      { success: false, message: "Token and new password are required" },
      { status: 400 },
    )
  }

  // 2) forward to backend
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const result = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg =
        typeof result === "object" && "message" in result
          ? (result as { message: string }).message
          : "Failed to reset password"
      return NextResponse.json(
        { success: false, message: msg },
        { status: res.status },
      )
    }

    return NextResponse.json(
      { success: true, message: "Password has been reset" },
      { status: 200 },
    )
  } catch (err) {
    console.error("[reset-password] network error:", err)
    return NextResponse.json(
      { success: false, message: "Password reset service unavailable" },
      { status: 502 },
    )
  }
}
