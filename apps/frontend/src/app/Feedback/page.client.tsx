// src/app/feedback/page.client.tsx
"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import React, { useState } from "react"

import { submitFeedback } from "@/api/feedback/feedbackApi"
import Button from "@/components/Buttons/Button"
import Card, { CardContent } from "@/components/cards/Card"
import Input from "@/components/UtilityComponents/Input"
import { Textarea } from "@/components/UtilityComponents/textarea"

export default function FeedbackClient() {
  const { data: session } = useSession()

  const [feedback, setFeedback] = useState<string>("")
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Now only pass the feedback text; we no longer need userId here.
    const success = await submitFeedback(feedback)
    setLoading(false)

    if (success) {
      setSubmitted(true)
      setFeedback("")
    } else {
      setError("Failed to submit feedback. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-8">
      {/* Back to Dashboard */}
      <div className="mb-4 w-full max-w-md">
        <Link
          href="/dashboard"
          className="inline-block text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="mb-6 text-center text-4xl font-extrabold text-black">
        Feedback
      </h1>
      <p className="mb-6 max-w-md text-center text-lg text-gray-600">
        We value your feedback! Let us know how we can improve your experience.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="rounded-lg bg-gray-800 shadow-md">
          <CardContent>
            {submitted && (
              <p className="mb-4 text-center text-green-400">
                Thank you for your feedback!
              </p>
            )}
            {error && <p className="mb-4 text-center text-red-500">{error}</p>}

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block font-medium text-gray-300"
                >
                  Name
                </label>
                <Input
                  id="name"
                  value={session?.user?.name ?? ""}
                  disabled
                  placeholder="Your name"
                  className="rounded-md bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label
                  htmlFor="feedback"
                  className="mb-1 block font-medium text-gray-300"
                >
                  Feedback
                </label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your thoughts..."
                  rows={5}
                  required
                  className="rounded-md bg-white text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Submitting…" : "Submit Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
