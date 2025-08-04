// src/app/api/faqs/route.ts
import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

/**
 * Public FAQ endpoint (no auth).  Proxies GET /api/faqs → <BACKEND_URL>/api/faqs
 */
export async function GET(req: NextRequest) {
  // 1) Preserve any query string (e.g. ?page=1)
  const { search } = new URL(req.url)
  const upstreamUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/faqs${search}`

  // 2) Forward request (only cookies, no Authorization header)
  const upstream = await fetch(upstreamUrl, {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  })

  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("[faqs] upstream error:", text)
    return NextResponse.json(
      { error: text || "Upstream returned an error" },
      { status: upstream.status },
    )
  }

  // 3) Return the JSON from the backend verbatim
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  })
}
