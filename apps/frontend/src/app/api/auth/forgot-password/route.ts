// src/app/api/auth/forgot-password/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export const runtime = "nodejs"

interface ForgotPasswordRequestBody {
  email: string
}

interface BackendError {
  message?: string
}

interface JsonResponse {
  success: boolean
  message: string
}

interface BackendSuccess {
  resetToken?: string // if your backend returns one
}

type BackendResponse = BackendError | BackendSuccess

if (!process.env.BACKEND_URL) {
  throw new Error("Missing BACKEND_URL environment variable")
}
const BACKEND_URL = process.env.BACKEND_URL

export async function POST(
  request: NextRequest,
): Promise<NextResponse<JsonResponse>> {
  // 1) Parse & validate JSON
  let body: ForgotPasswordRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 },
    )
  }

  const { email } = body
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 },
    )
  }

  // 2) Proxy to backend
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const backendData = (await res.json()) as BackendResponse

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            (backendData as BackendError).message ??
            "Failed to request password reset",
        },
        { status: res.status },
      )
    }

    return NextResponse.json({
      success: true,
      message:
        "If that email is registered, you’ll receive a reset link shortly.",
    })
  } catch (err) {
    console.error("[forgot-password] Fetch error:", err)
    return NextResponse.json(
      { success: false, message: "Unable to process request" },
      { status: 500 },
    )
  }
}
