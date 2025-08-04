// src/app/api/analytics/goals/route.ts

import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

export async function GET(req: NextRequest) {
  // 1) Auth guard
  const session = await getServerSession(authOptions)
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 2) Forward any query params
  const { search } = new URL(req.url)
  const upstream = await fetch(`${BACKEND_URL}/api/analytics/goals${search}`, {
    headers: {
      // forward cookie in case your analytics routes use cookie auth
      cookie: req.headers.get("cookie") ?? "",
      // forward JWT
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  // 3) Handle errors
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("Upstream /analytics/goals error:", text)
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  // 4) Return JSON verbatim
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
