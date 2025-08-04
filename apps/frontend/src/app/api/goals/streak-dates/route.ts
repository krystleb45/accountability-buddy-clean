// src/app/api/dashboard/stats/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

export async function GET(req: NextRequest) {
  // 1) Ensure the user is logged in and we have their JWT
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 2) Preserve any query string (if you ever need page/limit, etc.)
  const { search } = new URL(req.url)
  const upstreamUrl = `${BACKEND_URL}/api/dashboard/stats${search}`

  // 3) Fetch from backend with cookies + Authorization header
  const upstream = await fetch(upstreamUrl, {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  // 4) If backend errored, forward the error
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("[dashboard/stats] upstream error:", text)
    return NextResponse.json(
      { error: text || "Upstream returned an error" },
      { status: upstream.status },
    )
  }

  // 5) Otherwise return the JSON as‐is
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
