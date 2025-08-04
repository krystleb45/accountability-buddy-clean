// src/app/api/analytics/goals/[goalId]/date-range/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

export async function GET(
  req: NextRequest,
  { params }: { params: { goalId: string } },
) {
  // 1) Auth
  const session = await getServerSession(authOptions)
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 2) Build upstream URL including any ?query=string
  const { search } = new URL(req.url)
  const url = `${BACKEND_URL}/api/analytics/goals/${encodeURIComponent(params.goalId)}/date-range${search}`

  // 3) Proxy with both cookie + Authorization
  const upstream = await fetch(url, {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  // 4) Error handling
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error(`Upstream analytics error for goal ${params.goalId}:`, text)
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  // 5) Return the JSON verbatim
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
