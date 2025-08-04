// src/app/api/dashboard/stats/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

export async function GET(req: NextRequest) {
  // 1) Fetch NextAuth session; if no JWT, return 401
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 2) Preserve any query parameters:
  const { search } = new URL(req.url)
  const upstreamUrl = `${BACKEND_URL}/api/dashboard/stats${search}`

  // 3) Proxy to backend with both cookies (for any cookie‐based auth) and Authorization header
  const upstream = await fetch(upstreamUrl, {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  // 4) If backend returned an error, forward it
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("[dashboard/stats] upstream error:", text)
    return NextResponse.json(
      { error: text || "Upstream returned an error" },
      { status: upstream.status },
    )
  }

  // 5) Return the JSON response verbatim
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
