// src/app/api/groups/[groupId]/members/route.ts - CONSISTENT VERSION
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"

export async function GET(
  _request: NextRequest,
  { params }: { params: { groupId: string } },
) {
  console.log(
    "[MEMBERS PROXY] GET request received for groupId:",
    params.groupId,
  )

  try {
    const session = await getServerSession(authOptions)
    console.log("[MEMBERS PROXY] Session exists:", !!session)
    console.log("[MEMBERS PROXY] User ID:", session?.user?.id)

    if (!session?.user?.id) {
      console.log("[MEMBERS PROXY] No session - returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check multiple token locations (consistent pattern)
    const accessToken =
      (session.user as any).accessToken ||
      (session as any).accessToken ||
      (session as any).access_token

    console.log("[MEMBERS PROXY] Access Token exists:", !!accessToken)

    if (!accessToken) {
      console.log("[MEMBERS PROXY] No access token found")
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 },
      )
    }

    const { groupId } = params
    const backendUrl = `${BACKEND_URL}/api/groups/${groupId}/members`

    console.log(`[MEMBERS PROXY] GET ${backendUrl}`)
    console.log(
      "[MEMBERS PROXY] Using token:",
      `${accessToken.substring(0, 20)}...`,
    )

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log(
      `[MEMBERS PROXY] Express responded with status: ${response.status}`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`,
      }))
      console.error(`[MEMBERS PROXY ERROR] ${response.status}:`, errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log(`[MEMBERS PROXY SUCCESS] Retrieved members:`, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[MEMBERS PROXY ERROR] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } },
) {
  console.log(
    "[MEMBERS PROXY] POST request received for groupId:",
    params.groupId,
  )

  try {
    const session = await getServerSession(authOptions)
    console.log("[MEMBERS PROXY POST] Session exists:", !!session)
    console.log("[MEMBERS PROXY POST] User ID:", session?.user?.id)

    if (!session?.user?.id) {
      console.log("[MEMBERS PROXY POST] No session - returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check multiple token locations (same consistent pattern as GET)
    const accessToken =
      (session.user as any).accessToken ||
      (session as any).accessToken ||
      (session as any).access_token

    console.log("[MEMBERS PROXY POST] Access Token exists:", !!accessToken)

    if (!accessToken) {
      console.log("[MEMBERS PROXY POST] No access token found")
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 },
      )
    }

    const { groupId } = params
    const body = await request.json()
    const backendUrl = `${BACKEND_URL}/api/groups/${groupId}/members`

    console.log(`[MEMBERS PROXY POST] POST ${backendUrl}`)
    console.log("[MEMBERS PROXY POST] Request body:", body)
    console.log(
      "[MEMBERS PROXY POST] Using token:",
      `${accessToken.substring(0, 20)}...`,
    )

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log(
      `[MEMBERS PROXY POST] Express responded with status: ${response.status}`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`,
      }))
      console.error(`[MEMBERS PROXY POST ERROR] ${response.status}:`, errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log(`[MEMBERS PROXY POST SUCCESS] Added member:`, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[MEMBERS PROXY POST ERROR] Error:", error)
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
}
