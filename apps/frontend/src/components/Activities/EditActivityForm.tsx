// src/components/Activities/EditActivityForm.tsx
"use client"

import type { ReactElement } from "react"

import React, { useCallback, useEffect, useState } from "react"

export type ActivityStatus = "pending" | "in-progress" | "completed"

export interface ActivityData {
  id: string
  title: string
  description: string
  status: ActivityStatus
}

export interface EditActivityFormProps {
  /** The activity to load into the form */
  activity: ActivityData
  /** Called with the updated values */
  onSubmit: (updated: ActivityData) => void
  /** Optional cancel handler */
  onCancel?: () => void
}

export default function EditActivityForm({
  activity,
  onSubmit,
  onCancel,
}: EditActivityFormProps): ReactElement {
  const [title, setTitle] = useState<string>(activity.title)
  const [description, setDescription] = useState<string>(activity.description)
  const [status, setStatus] = useState<ActivityStatus>(activity.status)
  const [error, setError] = useState<string | null>(null)

  // Keep local state in sync if `activity` prop changes
  useEffect(() => {
    setTitle(activity.title)
    setDescription(activity.description)
    setStatus(activity.status)
  }, [activity])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault()
      const trimmedTitle = title.trim()
      const trimmedDesc = description.trim()
      if (!trimmedTitle || !trimmedDesc) {
        setError("Title and Description are required.")
        return
      }
      setError(null)
      onSubmit({
        id: activity.id,
        title: trimmedTitle,
        description: trimmedDesc,
        status,
      })
    },
    [title, description, status, activity.id, onSubmit],
  )

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        mx-auto max-w-lg rounded-lg bg-gray-900 p-6 text-white shadow-lg
      `}
    >
      <h2 className="mb-4 text-2xl font-semibold text-primary">
        Edit Activity
      </h2>

      {error && (
        <p className="mb-3 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="edit-title" className="mb-1 block text-gray-400">
          Title
        </label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter activity title"
          className={`
            w-full rounded border border-gray-700 bg-gray-800 p-2 text-white
            focus:border-primary focus:outline-none
          `}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="edit-description" className="mb-1 block text-gray-400">
          Description
        </label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter activity description"
          className={`
            w-full rounded border border-gray-700 bg-gray-800 p-2 text-white
            focus:border-primary focus:outline-none
          `}
          rows={3}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="edit-status" className="mb-1 block text-gray-400">
          Status
        </label>
        <select
          id="edit-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ActivityStatus)}
          className={`
            w-full rounded border border-gray-700 bg-gray-800 p-2 text-white
            focus:border-primary focus:outline-none
          `}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="submit"
          className={`
            rounded-lg bg-primary px-4 py-2 font-bold text-black transition
          `}
        >
          Save Changes
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`
              rounded-lg bg-red-500 px-4 py-2 text-white transition
              hover:bg-red-400
            `}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
