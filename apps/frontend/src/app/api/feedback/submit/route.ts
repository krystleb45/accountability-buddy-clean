import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { feedback } = await request.json()

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { success: false, error: "Feedback is required" },
        { status: 400 }
      )
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

    const response = await fetch(`${backendUrl}/api/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify({
        message: feedback,
        type: "other",  // Default type since form doesn't have type selector
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || "Failed to submit feedback" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback submit error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 }
    )
  }
}