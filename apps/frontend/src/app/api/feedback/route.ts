// src/app/api/feedback/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

interface RequestBody {
  name: string
  feedback: string
}

interface JsonResponse {
  success: boolean
  message?: string
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<JsonResponse>> {
  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 },
    )
  }

  const name = (body.name ?? "").trim()
  const feedback = (body.feedback ?? "").trim()

  if (!name || !feedback) {
    return NextResponse.json(
      { success: false, message: "Name and feedback are required." },
      { status: 400 },
    )
  }

  try {
    // TODO: instead of console.log, hook into your backend or ticketing system
    console.log(`💬 Feedback received from ${name}:`, feedback)

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback!",
    })
  } catch (err) {
    console.error("Error processing feedback:", err)
    return NextResponse.json(
      { success: false, message: "Unable to submit feedback at this time." },
      { status: 500 },
    )
  }
}
