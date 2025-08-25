"use client"

import { useSession } from "next-auth/react"
import React, { useState } from "react"
import { toast } from "sonner"

interface Props {
  isOpen: boolean
  onClose: () => void
  onChallengeCreated?: () => void
}

const defaultForm = {
  title: "",
  description: "",
  goal: "",
  endDate: "",
  visibility: "public",
  rewards: [] as string[],
  progressTracking: false,
}

const CreateChallengeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onChallengeCreated,
}) => {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!userId) {
      toast.error("You must be logged in to create a challenge.")
      return
    }
    const { title, description, goal, endDate } = form
    if (!title || !goal || !description || !endDate) {
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      setLoading(true)
      toast.success("🎉 Challenge created!")
      onClose()
      onChallengeCreated?.()
      setForm(defaultForm)
    } catch {
      toast.error("Failed to create challenge.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center bg-black/50
      `}
    >
      <div
        className={`
          w-full max-w-xl rounded-lg border border-gray-700 bg-gray-900 p-6
          text-white shadow-lg
        `}
      >
        <h2 className="mb-4 text-xl font-semibold">
          ✍️ Create a New Challenge
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className={`
              w-full rounded border border-gray-700 bg-gray-800 px-4 py-2
              text-white
              focus:ring-2 focus:ring-green-500 focus:outline-none
            `}
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className={`
              w-full rounded border border-gray-700 bg-gray-800 px-4 py-2
              text-white
              focus:ring-2 focus:ring-green-500 focus:outline-none
            `}
            rows={3}
            required
          />
          <input
            name="goal"
            value={form.goal}
            onChange={handleChange}
            placeholder="Goal (e.g., Walk 10k steps daily)"
            className={`
              w-full rounded border border-gray-700 bg-gray-800 px-4 py-2
              text-white
              focus:ring-2 focus:ring-green-500 focus:outline-none
            `}
            required
          />
          <label className="block">
            <span className="text-sm text-gray-400">End Date</span>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className={`
                mt-1 w-full rounded border border-gray-700 bg-gray-800 px-4 py-2
                text-white
                focus:ring-2 focus:ring-green-500 focus:outline-none
              `}
              required
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="progressTracking"
              checked={form.progressTracking}
              onChange={handleChange}
              className="accent-green-500"
            />
            Enable progress tracking
          </label>
          <label className="block">
            <span className="text-sm text-gray-400">Visibility</span>
            <select
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
              className={`
                mt-1 w-full rounded border border-gray-700 bg-gray-800 px-4 py-2
                text-white
                focus:ring-2 focus:ring-green-500 focus:outline-none
              `}
            >
              <option value="public">🌍 Public</option>
              <option value="private">🔒 Private</option>
            </select>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose()
                setForm(defaultForm)
              }}
              className={`
                rounded bg-gray-600 px-4 py-2
                hover:bg-gray-500
              `}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`
                rounded bg-green-600 px-4 py-2
                hover:bg-green-500
              `}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateChallengeModal
