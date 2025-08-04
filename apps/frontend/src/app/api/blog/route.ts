// src/app/api/blog/route.ts

import { NextResponse } from "next/server"

const BACKEND = process.env.BACKEND_URL!
if (!BACKEND) throw new Error("Missing BACKEND_URL")

export async function GET(request: Request) {
  // preserve any query string
  const { search } = new URL(request.url)

  const upstream = await fetch(`${BACKEND}/api/blog${search}`)
  const body = await upstream.text()

  if (!upstream.ok) {
    console.error("Upstream /blog error:", body)
    return NextResponse.json({ error: body }, { status: upstream.status })
  }

  return new NextResponse(body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
