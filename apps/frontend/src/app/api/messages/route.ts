// src/app/api/messages/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "../auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Messages API GET: Starting request...")

    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken) {
      console.log("❌ Messages API GET: No session or access token")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { search } = new URL(req.url)
    console.log("🔗 Messages API GET: Search params:", search)
    console.log(
      "🌐 Messages API GET: Backend URL:",
      `${BACKEND_URL}/api/messages${search}`,
    )

    const upstream = await fetch(`${BACKEND_URL}/api/messages${search}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: "no-store",
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      console.error("🚨 Upstream GET /messages error:", {
        status: upstream.status,
        statusText: upstream.statusText,
        response: text,
        url: `${BACKEND_URL}/api/messages${search}`,
      })
      return NextResponse.json(
        {
          error: text || "Upstream error",
          status: upstream.status,
          url: `${BACKEND_URL}/api/messages${search}`,
        },
        { status: upstream.status },
      )
    }

    console.log("✅ Messages API GET: Success!")
    console.log("📊 Response length:", text.length)

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    })
  } catch (error) {
    console.error("🚨 Messages API GET: Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        backendUrl: BACKEND_URL,
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("📤 Messages API POST: Starting request...")

    const session = await getServerSession(authOptions)
    if (!session?.user?.accessToken) {
      console.log("❌ Messages API POST: No session or access token")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.text()
    console.log("📋 Messages API POST: Body length:", body.length)
    console.log(
      "🌐 Messages API POST: Backend URL:",
      `${BACKEND_URL}/api/messages`,
    )

    const upstream = await fetch(`${BACKEND_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body,
      cache: "no-store",
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      console.error("🚨 Upstream POST /messages error:", {
        status: upstream.status,
        statusText: upstream.statusText,
        response: text,
        requestBody: body,
      })
      return NextResponse.json(
        {
          error: text || "Upstream error",
          status: upstream.status,
        },
        { status: upstream.status },
      )
    }

    console.log("✅ Messages API POST: Success!")

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    })
  } catch (error) {
    console.error("🚨 Messages API POST: Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
