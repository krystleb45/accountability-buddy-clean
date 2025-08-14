import axios, { isAxiosError } from "axios"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "../[...nextauth]/route"

export async function POST() {
  try {
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
    const response = await axios.post<{
      success: boolean
      message?: string
      data?: any
    }>("/auth/send-verification-email", undefined, {
      baseURL: `${backendUrl}/api`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Get the response data
    const data = response.data

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message ?? "Verification email send failed.",
        },
        { status: response.status },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message ?? "Verification email sent successful.",
        data: data.data,
      },
      { status: response.status },
    )
  } catch (err: unknown) {
    console.error("Unexpected error in /api/auth/send-verification-email:", err)

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
