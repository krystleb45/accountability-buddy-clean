// src/app/api/user/points/route.ts
import type { Session as NextAuthSession } from "next-auth"
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const runtime = "nodejs"

interface PointsResponse {
  points: number
}
interface ErrorResponse {
  message: string
}
interface BackendResponse {
  points?: number
  message?: string
}

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (
    !session ||
    !session.user ||
    typeof (session.user as any).id !== "string" ||
    typeof (session.user as any).accessToken !== "string"
  ) {
    return null
  }
  return session as NextAuthSession & {
    user: { id: string; accessToken: string }
  }
}

const BACKEND_URL = process.env.BACKEND_URL
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

/**
 * GET /api/user/points
 */
export async function GET(): Promise<
  NextResponse<PointsResponse> | NextResponse<ErrorResponse>
> {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const resp = await fetch(`${BACKEND_URL}/api/user/points`, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
  })

  let body: BackendResponse
  try {
    body = await resp.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid backend response" },
      { status: 502 },
    )
  }

  if (!resp.ok || typeof body.points !== "number") {
    return NextResponse.json(
      { message: body.message ?? "Error fetching points" },
      { status: resp.status },
    )
  }

  return NextResponse.json({ points: body.points })
}

/**
 * POST /api/user/points
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<PointsResponse> | NextResponse<ErrorResponse>> {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  // parse & validate JSON
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
  }
  const { pointsDelta } = payload as { pointsDelta?: unknown }
  if (typeof pointsDelta !== "number" || Number.isNaN(pointsDelta)) {
    return NextResponse.json(
      { message: "Invalid pointsDelta" },
      { status: 400 },
    )
  }

  // proxy to backend
  const resp = await fetch(`${BACKEND_URL}/api/user/points`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify({ pointsDelta }),
  })

  let body: BackendResponse
  try {
    body = await resp.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid backend response" },
      { status: 502 },
    )
  }

  if (!resp.ok || typeof body.points !== "number") {
    return NextResponse.json(
      { message: body.message ?? "Error updating points" },
      { status: resp.status },
    )
  }

  return NextResponse.json({ points: body.points })
}
