// src/app/api/groups/[groupId]/leave/route.ts - COMPLETE FIXED VERSION
import type { NextRequest } from "next/server"

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface Context {
  params: { groupId: string }
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5050"

export async function POST(_request: NextRequest, { params }: Context) {
  try {
    const session = await getServerSession(authOptions)
    console.log("🔍 [LEAVE PROXY] Session exists:", !!session)
    console.log("🔍 [LEAVE PROXY] User ID:", session?.user?.id)

    if (!session?.user?.id) {
      console.log("❌ [LEAVE PROXY] No session - returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check multiple token locations
    const accessToken =
      (session.user as any).accessToken ||
      (session as any).accessToken ||
      (session as any).access_token

    console.log("🔍 [LEAVE PROXY] Access Token exists:", !!accessToken)

    if (!accessToken) {
      console.log("❌ [LEAVE PROXY] No access token found")
      console.log(
        "🔍 [LEAVE PROXY] Available session keys:",
        Object.keys(session),
      )
      console.log(
        "🔍 [LEAVE PROXY] Available user keys:",
        Object.keys(session.user || {}),
      )
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 },
      )
    }

    const { groupId } = params
    const backendUrl = `${BACKEND_URL}/api/groups/${groupId}/leave`

    console.log(`🚀 [LEAVE PROXY] POST ${backendUrl}`)
    console.log(
      "🔑 [LEAVE PROXY] Using token:",
      `${accessToken.substring(0, 20)}...`,
    )

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    console.log(
      `📥 [LEAVE PROXY] Express responded with status: ${response.status}`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`,
      }))
      console.error(`❌ [LEAVE PROXY ERROR] ${response.status}:`, errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log(`✅ [LEAVE PROXY SUCCESS] Left group ${groupId}:`, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error(
      "💥 [LEAVE PROXY ERROR] Error proxying leave group request:",
      error,
    )
    return NextResponse.json(
      { error: "Failed to leave group" },
      { status: 500 },
    )
  }
}
