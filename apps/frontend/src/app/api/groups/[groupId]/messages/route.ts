// src/app/api/groups/[groupId]/messages/route.ts
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } },
) {
  console.log(
    "[MESSAGES PROXY] Messages route hit for groupId:",
    params.groupId,
  )

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken =
      (session.user as any).accessToken ||
      (session as any).accessToken ||
      (session as any).access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 },
      )
    }

    const { groupId } = params
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const backendUrl = `${BACKEND_URL}/api/groups/${groupId}/messages${queryString ? `?${queryString}` : ""}`

    console.log(`[MESSAGES PROXY] Fetching from Express: ${backendUrl}`)

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log(
      `[MESSAGES PROXY] Express responded with status: ${response.status}`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`,
      }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[MESSAGES PROXY] Error:", error)
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } },
) {
  console.log("[MESSAGES PROXY] POST message request received")

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken =
      (session.user as any).accessToken ||
      (session as any).accessToken ||
      (session as any).access_token

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 },
      )
    }

    const { groupId } = params
    const body = await request.json()
    const backendUrl = `${BACKEND_URL}/api/groups/${groupId}/messages`

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`,
      }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[MESSAGES POST PROXY] Error:", error)
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 })
  }
}
