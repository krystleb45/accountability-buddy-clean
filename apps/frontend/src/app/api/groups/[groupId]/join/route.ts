// src/app/api/groups/[groupId]/join/route.ts - COMPLETE FIXED VERSION
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
    console.log("🔍 [JOIN PROXY] Session exists:", !!session)
    console.log("🔍 [JOIN PROXY] User ID:", session?.user?.id)

    if (!session?.user?.id) {
      console.log("❌ [JOIN PROXY] No session - returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check multiple token locations
    const accessToken =
      (session.user as any).accessToken ||
      (session as any).accessToken ||
      (session as any).access_token

    console.log("🔍 [JOIN PROXY] Access Token exists:", !!accessToken)

    if (!accessToken) {
      console.log("❌ [JOIN PROXY] No access token found")
      console.log(
        "🔍 [JOIN PROXY] Available session keys:",
        Object.keys(session),
      )
      console.log(
        "🔍 [JOIN PROXY] Available user keys:",
        Object.keys(session.user || {}),
      )
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 },
      )
    }

    const { groupId } = params
    const backendUrl = `${BACKEND_URL}/api/groups/${groupId}/join`

    console.log(`🚀 [JOIN PROXY] POST ${backendUrl}`)
    console.log(
      "🔑 [JOIN PROXY] Using token:",
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
      `📥 [JOIN PROXY] Express responded with status: ${response.status}`,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `Express server error: ${response.status}`,
      }))
      console.error(`❌ [JOIN PROXY ERROR] ${response.status}:`, errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log(`✅ [JOIN PROXY SUCCESS] Joined group ${groupId}:`, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error(
      "💥 [JOIN PROXY ERROR] Error proxying join group request:",
      error,
    )
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 })
  }
}
