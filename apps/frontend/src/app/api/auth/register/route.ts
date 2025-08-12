import type { NextRequest } from "next/server"

import axios from "axios"
import { NextResponse } from "next/server"

interface RegisterRequest {
  name: string
  username: string
  email: string
  password: string
  selectedPlan?: string
  billingCycle?: "monthly" | "yearly"
}

interface JsonResponse {
  success: boolean
  message: string
  data?: any
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<JsonResponse>> {
  let body: Partial<RegisterRequest>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 },
    )
  }

  try {
    // Get backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 },
      )
    }

    // Use native fetch instead of http utility
    const response = await axios.post<{
      success: boolean
      message?: string
      data?: any
    }>(`${backendUrl}/api/auth/register`, {
      name: body.name,
      username: body.username,
      email: body.email,
      password: body.password,
      selectedPlan: body.selectedPlan,
      billingCycle: body.billingCycle,
    })

    // Get the response data
    const data = response.data

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message ?? "Registration failed." },
        { status: response.status },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message ?? "Registration successful.",
        data: data.data,
      },
      { status: response.status },
    )
  } catch (err: unknown) {
    console.error("Unexpected error in /api/auth/register:", err)
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    )
  }
}
