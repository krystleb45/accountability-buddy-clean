// src/app/api/feedback/submit/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) {
  throw new Error("Missing BACKEND_URL environment variable")
}

export async function POST(req: NextRequest) {
  // 1) Ensure the user is signed in and has an accessToken
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    )
  }

  // 2) Parse the JSON body from the client.
  //    We expect { feedback: string } from the front-end.
  let clientPayload: { feedback: string }
  try {
    clientPayload = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 },
    )
  }

  // 3) Re-shape it to exactly { message, type } and forward to Express:
  const upstreamBody = {
    message: clientPayload.feedback,
    type: "other", // hard-coded “other” for now
  }

  const upstream = await fetch(`${BACKEND_URL}/api/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
      cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(upstreamBody),
  })

  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("[feedback/submit] upstream error:", text)
    return NextResponse.json(
      { success: false, message: text || "Upstream error" },
      { status: upstream.status },
    )
  }

  // 4) Return the backend’s JSON verbatim
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
