import type { NextRequest } from "next/server"

import axios, { isAxiosError } from "axios"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "../[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    const verificationToken = req.nextUrl.searchParams.get("token")

    const session = await getServerSession(authOptions)
    const token = session?.user?.accessToken

    if (!token) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 },
      )
    }

    // Get backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 },
      )
    }

    // Use native fetch instead of http utility
    const response = await axios.get<{
      success: boolean
      message?: string
    }>("/auth/verify-email", {
      baseURL: `${backendUrl}/api`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        token: verificationToken,
      },
    })

    // Get the response data
    const data = response.data

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message ?? "Email verification failed.",
        },
        { status: response.status },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message ?? "Email verified successfully.",
      },
      { status: response.status },
    )
  } catch (err: unknown) {
    console.error("Unexpected error in /api/auth/verify-email:", err)

    if (isAxiosError(err)) {
      return NextResponse.json(
        {
          success: false,
          message: err.response?.data?.message ?? "Internal server error.",
        },
        { status: err.response?.status ?? 500 },
      )
    }

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    )
  }
}
