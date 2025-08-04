// src/app/api/goals/[goalId]/progress/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

/**
 * PUT /api/goals/:goalId/progress
 * Proxy to Express PUT /api/goals/:goalId/progress
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { goalId: string } },
) {
  // 1) Authentication
  const session = await getServerSession(authOptions)
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { goalId } = params
  // 2) Forward the JSON body + headers
  const bodyText = await req.text()
  const upstream = await fetch(
    `${BACKEND_URL}/api/goals/${encodeURIComponent(goalId)}/progress`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
        cookie: req.headers.get("cookie") ?? "",
      },
      body: bodyText,
    },
  )

  // 3) Error handling
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error(`🚨 Upstream PUT /goals/${goalId}/progress error:`, text)
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  // 4) Return raw JSON
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
