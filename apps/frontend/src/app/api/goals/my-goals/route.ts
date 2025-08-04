// src/app/api/goals/my-goals/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

/**
 * GET /api/goals/my-goals
 * Proxy to Express GET /api/goals/my-goals
 */
export async function GET(req: NextRequest) {
  // 1) Make sure the user is signed in
  const session = await getServerSession(authOptions)
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 2) Forward any query string (e.g. pagination)
  const { search } = new URL(req.url)
  const upstream = await fetch(`${BACKEND_URL}/api/goals/my-goals${search}`, {
    headers: {
      // forward the NextAuth cookie if your backend checks it
      cookie: req.headers.get("cookie") ?? "",
      // forward the JWT
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  // 3) Bubble up errors
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("🚨 Upstream GET /goals/my-goals error:", text)
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  // 4) Return the exact JSON from your Express server
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
