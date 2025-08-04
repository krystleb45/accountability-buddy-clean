// src/app/api/goals/public/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

/**
 * GET /api/goals/public
 * Proxy to Express GET /api/goals/public
 */
export async function GET(req: NextRequest) {
  // 1) Ensure user is signed in
  const session = await getServerSession(authOptions)
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // 2) Forward any query string (e.g. ?page=2&limit=10)
  const { search } = new URL(req.url)
  const upstream = await fetch(`${BACKEND_URL}/api/goals/public${search}`, {
    headers: {
      // forward NextAuth cookie if your backend needs it
      cookie: req.headers.get("cookie") ?? "",
      // forward the JWT
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  })

  // 3) Bubble up any upstream errors
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("🚨 Upstream GET /goals/public error:", text)
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
