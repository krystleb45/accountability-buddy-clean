// example: src/app/api/profile/image/route.ts
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND = process.env.BACKEND_URL!
if (!BACKEND) throw new Error("Missing BACKEND_URL")

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const formData = await req.formData()
  const upstream = await fetch(`${BACKEND}/api/profile/image`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
    body: formData as any,
  })
  const text = await upstream.text()
  if (!upstream.ok) {
    console.error("Upstream upload error:", text)
    return NextResponse.json({ error: text }, { status: upstream.status })
  }
  return new NextResponse(text, {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
