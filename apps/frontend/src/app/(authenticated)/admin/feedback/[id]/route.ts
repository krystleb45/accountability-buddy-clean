import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

    const response = await fetch(`${backendUrl}/api/admin/feedback/${params.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete feedback error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete feedback" },
      { status: 500 }
    )
  }
}