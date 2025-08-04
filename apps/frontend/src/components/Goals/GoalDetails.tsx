"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"

import type { Goal } from "@/services/goalService"

import GoalService from "@/services/goalService"

import styles from "./GoalDetails.module.css"

interface Props {
  goalId: string
  onUpdate: (updated: Goal) => void
  onDelete: () => Promise<void>
  onClose: () => void
}

export default function GoalDetails({
  goalId,
  onUpdate,
  onDelete,
  onClose,
}: Props) {
  const { data: session, status } = useSession()
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // form fields
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
  const [category, setCategory] = useState<string>("")

  // Helper function to format date for input
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      // Check if the date is valid
      if (Number.isNaN(date.getTime())) return ""
      const isoString: string = date.toISOString()
      const datePart: string = isoString.split("T")[0] ?? "" // Fix the undefined issue
      return datePart // YYYY-MM-DD format
    } catch {
      return ""
    }
  }

  // Helper function to handle date from input
  const formatDateFromInput = (dateString: string): string => {
    if (!dateString) return ""
    try {
      // Ensure we're working with a valid date in ISO format
      const date = new Date(dateString)
      // Check if the date is valid
      if (Number.isNaN(date.getTime())) return ""
      return date.toISOString()
    } catch {
      return ""
    }
  }

  // fetch goal on open
  useEffect(() => {
    let cancelled = false
    if (status !== "authenticated") {
      setLoading(false)
      return
    }

    ;(async () => {
      setLoading(true)
      try {
        const token = session!.user.accessToken
        const g = await GoalService.getGoalDetails(goalId, token)
        if (!g) throw new Error("Goal not found")
        if (!cancelled) {
          setGoal(g)
          setTitle(g.title || "")
          setDescription(g.description || "")
          setDueDate(g.dueDate ? formatDateForInput(g.dueDate) : "") // Safe handling
          setCategory(g.category || "")
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [goalId, session, status])

  // save handler
  const saveChanges = async () => {
    if (!goal || status !== "authenticated") return
    setLoading(true)
    setError("") // Clear any previous errors

    try {
      const token = session!.user.accessToken

      // Prepare the update data with properly formatted date
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate ? formatDateFromInput(dueDate) : "",
        category: category.trim(),
      }

      console.log("Updating goal with data:", updateData) // Debug log

      const updated = await GoalService.updateGoal(goal.id, updateData, token)

      if (!updated) throw new Error("Update failed")

      console.log("Goal updated successfully:", updated) // Debug log

      // Update ALL local state with the returned data
      setGoal(updated)
      setTitle(updated.title)
      setDescription(updated.description)
      setDueDate(updated.dueDate ? formatDateForInput(updated.dueDate) : "")
      setCategory(updated.category)

      console.log("Local state updated with:", {
        title: updated.title,
        description: updated.description,
        dueDate: updated.dueDate,
        category: updated.category,
      })

      // Notify parent component
      onUpdate(updated)

      // Close the modal after successful update
      setTimeout(() => {
        onClose()
      }, 500) // Small delay to let user see the success

      console.log("Parent component notified and edit mode exited") // Debug log
    } catch (e: any) {
      console.error("Save error:", e) // Debug log
      setError(e.message || "Failed to save changes")
    } finally {
      setLoading(false)
    }
  }

  // delete handler
  const handleDelete = async () => {
    if (status !== "authenticated") return
    setLoading(true)
    try {
      await GoalService.deleteGoal(goalId, session!.user.accessToken)
      await onDelete()
      onClose()
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (e: any) {
      setError("Failed to delete goal")
      setLoading(false)
    }
  }

  // Cancel editing and reset form
  const cancelEdit = () => {
    if (goal) {
      setTitle(goal.title || "")
      setDescription(goal.description || "")
      setDueDate(goal.dueDate ? formatDateForInput(goal.dueDate) : "")
      setCategory(goal.category || "")
    }
    setIsEditing(false)
    setError("")
  }

  if (loading) return <p className={styles.message}>Loading…</p>
  if (error) return <p className={styles.error}>{error}</p>
  if (!goal) return <p className={styles.message}>No goal found.</p>

  return (
    <motion.div
      className={styles.container}
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-details-header"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <button className={styles.close} onClick={onClose}>
        ✕
      </button>

      {isEditing ? (
        <>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter goal title"
          />

          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter goal description"
          />

          <label className={styles.label}>Due Date</label>
          <input
            type="date"
            className={styles.input}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label className={styles.label}>Category</label>
          <input
            className={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category"
          />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              onClick={saveChanges}
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? "💾 Saving..." : "💾 Save"}
            </button>
            <button
              onClick={cancelEdit}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 id="goal-details-header" className={styles.title}>
            {goal.title}
          </h2>
          <p className={styles.description}>
            {goal.description || "No description."}
          </p>
          <p className={styles.date}>
            Due:{" "}
            {goal.dueDate
              ? new Date(goal.dueDate).toLocaleDateString()
              : "No due date"}
          </p>

          {/* Debug info */}
          <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
            Debug - Raw dueDate: {JSON.stringify(goal.dueDate)}
          </div>

          <div className={styles.actions}>
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              ✏️ Edit
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              🗑️ Delete
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}
