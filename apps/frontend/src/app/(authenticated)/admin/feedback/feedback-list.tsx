"use client"

import { Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

interface Feedback {
  _id: string
  userId: string
  message: string
  type: string
  createdAt: string
}

interface FeedbackListProps {
  initialFeedback: Feedback[]
}

export default function FeedbackList({ initialFeedback }: FeedbackListProps) {
  const { data: session } = useSession()
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(initialFeedback)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) {
      return
    }

    setDeleting(id)

    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFeedbackList((prev) => prev.filter((f) => f._id !== id))
      } else {
        alert("Failed to delete feedback")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete feedback")
    } finally {
      setDeleting(null)
    }
  }

  if (feedbackList.length === 0) {
    return <p className="text-gray-400">No feedback submitted yet.</p>
  }

  return (
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(feedback._id)}
                disabled={deleting === feedback._id}
                className="text-red-400 hover:text-red-300 disabled:opacity-50"
                title="Delete feedback"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <p className="text-white">{feedback.message}</p>
          <p className="mt-2 text-xs text-gray-500">
            User ID: {feedback.userId}
          </p>
        </div>
      ))}
    </div>
  )
}