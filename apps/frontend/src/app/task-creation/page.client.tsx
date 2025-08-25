// src/app/task-creation/page.client.tsx
"use client"

import { motion } from "motion/react"
import React, { useEffect, useState } from "react"

import type { Task, TaskInput } from "@/api/tasks/taskApi"

import taskApi from "@/api/tasks/taskApi"

export default function TaskCreationClient() {
  const [formData, setFormData] = useState<TaskInput>({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
    priority: "medium",
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingTasks, setFetchingTasks] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Load tasks on mount
  useEffect(() => {
    ;(async () => {
      try {
        const data = await taskApi.fetchTasks()
        setTasks(data)
      } catch (err: any) {
        setError(err.message || "Failed to load tasks.")
      } finally {
        setFetchingTasks(false)
      }
    })()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((f) => ({ ...f, [name]: value }))
  }

  const validateForm = () => {
    setError("")
    if (!formData.title || !formData.description || !formData.dueDate) {
      setError("All fields are required.")
      return false
    }
    if (new Date(formData.dueDate) < new Date()) {
      setError("Due date must be in the future.")
      return false
    }
    if (
      tasks.some((t) => t.title.toLowerCase() === formData.title.toLowerCase())
    ) {
      setError("A task with this title already exists.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    if (!validateForm()) return

    setLoading(true)
    try {
      const newTask = await taskApi.createTask(formData)
      setTasks((ts) => [...ts, newTask])
      setSuccessMessage("Task created successfully!")
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        status: "pending",
        priority: "medium",
      })
    } catch (err: any) {
      setError(err.message || "Failed to create task.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`
        flex min-h-screen flex-col items-center bg-black p-6 text-white
      `}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg rounded-lg bg-gray-900 p-8 shadow-lg"
      >
        <h1 className="mb-6 text-center text-3xl font-bold text-green-400">
          Create a New Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <label htmlFor="title" className="block font-medium text-gray-300">
            Task Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className={`
              w-full rounded-lg border bg-gray-800 p-3 text-white
              focus:ring focus:outline-none
            `}
            required
          />

          {/* Description */}
          <label
            htmlFor="description"
            className="block font-medium text-gray-300"
          >
            Task Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows={4}
            className={`
              w-full rounded-lg border bg-gray-800 p-3 text-white
              focus:ring focus:outline-none
            `}
            required
          />

          {/* Priority */}
          <label htmlFor="priority" className="block font-medium text-gray-300">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`
              w-full rounded-lg border bg-gray-800 p-3 text-white
              focus:ring focus:outline-none
            `}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Due Date */}
          <label htmlFor="dueDate" className="block font-medium text-gray-300">
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            className={`
              w-full rounded-lg border bg-gray-800 p-3 text-white
              focus:ring focus:outline-none
            `}
            required
          />

          {/* Feedback */}
          {error && <p className="text-red-500">{error}</p>}
          {successMessage && <p className="text-green-400">{successMessage}</p>}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`
              w-full rounded-lg bg-green-500 py-3 text-black
              disabled:opacity-50
            `}
          >
            {loading ? "Creating…" : "Create Task"}
          </motion.button>
        </form>
      </motion.div>

      {/* Existing Tasks */}
      <div className="mt-10 w-full max-w-lg">
        <h2 className="mb-4 text-center text-2xl font-semibold text-green-400">
          Existing Tasks
        </h2>

        {fetchingTasks ? (
          <p className="text-center text-gray-400">Loading tasks…</p>
        ) : tasks.length > 0 ? (
          <ul className="space-y-4">
            {tasks.map((t) => (
              <li key={t._id} className="rounded-lg bg-gray-800 p-4 shadow-md">
                <h3 className="text-xl font-semibold text-white">{t.title}</h3>
                <p className="mb-1 text-gray-400">{t.description}</p>
                <p className="text-gray-500">
                  Due:{" "}
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                </p>
                <span className="text-sm font-semibold text-yellow-400">
                  {t.priority}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400">No tasks created yet.</p>
        )}
      </div>
    </div>
  )
}
