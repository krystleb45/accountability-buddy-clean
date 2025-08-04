// src/app/api/feedback/[feedbackId]/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
// Should be "http://localhost:5050/api"

if (!BACKEND_URL) {
  throw new Error("Missing BACKEND_URL environment variable")
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { feedbackId: string } },
) {
  // 1) Ensure the user is signed in
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    )
  }

  const { feedbackId } = params
  if (!feedbackId) {
    return NextResponse.json(
      { success: false, message: "feedbackId is required" },
      { status: 400 },
    )
  }

  // 2) Proxy the DELETE to Express WITHOUT adding "/api" again:
  const upstream = await fetch(
    `${BACKEND_URL}/api/feedback/${encodeURIComponent(feedbackId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        cookie: req.headers.get("cookie") ?? "",
      },
    },
  )

  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("[feedback/[feedbackId]] upstream error:", text)
    return NextResponse.json(
      { success: false, message: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
