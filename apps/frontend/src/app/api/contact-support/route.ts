import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    // Send to backend
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    
    const response = await fetch(`${backendUrl}/api/contact-support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || "Failed to send message")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact support error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 }
    )
  }
}