import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import FeedbackList from "./feedback-list"

interface Feedback {
  _id: string
  userId: string
  message: string
  type: string
  createdAt: string
}

export default async function AdminFeedbackPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    redirect("/login")
  }

  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

  let feedbackList: Feedback[] = []

  try {
    const response = await fetch(`${backendUrl}/api/admin/feedback`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: "no-store",
    })

    if (response.ok) {
      const data = await response.json()
      feedbackList = data.data?.feedback || []
    }
  } catch (error) {
    console.error("Failed to fetch feedback:", error)
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Feedback Management</h1>
      <FeedbackList initialFeedback={feedbackList} />
    </div>
  )
}