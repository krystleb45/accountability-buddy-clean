// src/app/api/goals/[goalId]/complete/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

/**
 * PUT /api/goals/:goalId/complete
 * Proxy to Express PUT /api/goals/:goalId/complete
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { goalId: string } },
) {
  // 1) Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { goalId } = params
  // 2) Forward to Express
  const upstream = await fetch(
    `${BACKEND_URL}/api/goals/${encodeURIComponent(goalId)}/complete`,
    {
      method: "PUT",
      headers: {
        // forward JWT first
        Authorization: `Bearer ${session.user.accessToken}`,
        // then cookie if your backend needs it
        cookie: req.headers.get("cookie") ?? "",
      },
    },
  )

  // 3) Bubble up errors
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error(`🚨 PUT /goals/${goalId}/complete error:`, text)
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  // 4) Return the raw JSON
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
