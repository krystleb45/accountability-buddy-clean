// src/app/api/goals/[goalId]/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const runtime = "nodejs"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

async function proxy(req: NextRequest, goalId: string): Promise<NextResponse> {
  // pull token from NextAuth session on the server
  const session = await getServerSession(authOptions)
  if (!session?.user.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // build URL + headers
  const { search } = new URL(req.url)
  const url = `${BACKEND_URL}/api/goals/${encodeURIComponent(goalId)}${search}`
  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.user.accessToken}`,
    cookie: req.headers.get("cookie") ?? "",
  }

  // attach PUT body
  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store", // ← disable Node‐fetch caching
  }
  if (req.method === "PUT") {
    headers["Content-Type"] = "application/json"
    init.body = await req.text()
  }

  // proxy
  const upstream = await fetch(url, init)
  const text = await upstream.text()

  if (!upstream.ok) {
    console.error(`🚨 Upstream ${req.method} /goals/${goalId} error:`, text)
    return NextResponse.json(
      { error: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  return new NextResponse(text || null, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}

export async function GET(
  req: NextRequest,
  { params }: { params: { goalId?: string } },
) {
  if (!params.goalId)
    return NextResponse.json({ error: "Goal ID missing" }, { status: 400 })
  return proxy(req, params.goalId)
}
export async function PUT(
  req: NextRequest,
  { params }: { params: { goalId?: string } },
) {
  if (!params.goalId)
    return NextResponse.json({ error: "Goal ID missing" }, { status: 400 })
  return proxy(req, params.goalId)
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { goalId?: string } },
) {
  if (!params.goalId)
    return NextResponse.json({ error: "Goal ID missing" }, { status: 400 })
  return proxy(req, params.goalId)
}
