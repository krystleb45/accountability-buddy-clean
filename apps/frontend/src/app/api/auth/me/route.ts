import axios, { isAxiosError } from "axios"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import type { User } from "@/types/mongoose.gen"

import { authOptions } from "../[...nextauth]/route"

export async function GET() {
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
    const response = await axios.get<{
      success: boolean
      message?: string
      data?: { user: User }
    }>("/auth/me", {
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
          message: data.message ?? "Failed to get user details",
        },
        { status: response.status },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: data.data,
      },
      { status: response.status },
    )
  } catch (err: unknown) {
    console.error("Unexpected error in /api/auth/me:", err)

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
