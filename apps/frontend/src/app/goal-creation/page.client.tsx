// src/app/goal-creation/page.client.tsx
"use client"

import { useRouter } from "next/navigation"
import React, { useState } from "react"

import type { Goal } from "@/services/goalService"

import GoalService from "@/services/goalService"

export default function GoalCreationClient() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [deadline, setDeadline] = useState("") // YYYY-MM-DD
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const newGoal: Partial<Goal> = {
        title,
        description,
        deadline,
        category,
        progress: 0,
      }
      await GoalService.createGoal(newGoal)
      router.push("/goals")
    } catch (err: any) {
      setError(err.message || "Failed to create goal.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">+ Add New Goal</h1>
      {error && <p className="mb-4 text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-gray-300">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded bg-gray-800 p-2 text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded bg-gray-800 p-2 text-white"
          />
        </div>
        {/* Category */}
        <div>
          <label className="mb-1 block text-gray-300">Category</label>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded bg-gray-800 p-2 text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-gray-300">Due Date</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded bg-gray-800 p-2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`
            w-full rounded bg-green-500 py-2 text-white
            hover:bg-green-600
          `}
        >
          {submitting ? "Creating…" : "Create Goal"}
        </button>
      </form>
    </main>
  )
}
