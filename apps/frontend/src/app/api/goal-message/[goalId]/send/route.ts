// src/app/api/goal-message/[goalId]/send/route.ts
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL!
if (!BACKEND_URL) throw new Error("Missing BACKEND_URL")

export async function POST(
  request: Request,
  { params }: { params: { goalId: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { goalId } = params
  const body = await request.json()

  const resp = await fetch(
    `${BACKEND_URL}/api/goal-message/${encodeURIComponent(goalId)}/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(body),
    },
  )

  if (!resp.ok) {
    const txt = await resp.text()
    console.error("Upstream /goal-message/send error:", txt)
    return NextResponse.json(
      { error: txt || "Upstream error" },
      { status: resp.status },
    )
  }

  const data = await resp.json()
  return NextResponse.json(data)
}
