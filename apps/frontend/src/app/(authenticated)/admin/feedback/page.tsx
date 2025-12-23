import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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

      {feedbackList.length === 0 ? (
        <p className="text-gray-400">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <div
              key={feedback._id}
              className="rounded-lg bg-gray-800 p-4 shadow"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white">
                  {feedback.type}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white">{feedback.message}</p>
              <p className="mt-2 text-xs text-gray-500">
                User ID: {feedback.userId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
