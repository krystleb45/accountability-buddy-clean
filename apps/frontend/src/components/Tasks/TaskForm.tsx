// src/components/Tasks/TaskForm.tsx
"use client"

import React, { useEffect, useState } from "react"

import styles from "./TaskForm.module.css"

export type Priority = "low" | "medium" | "high"
export type Status = "pending" | "in_progress" | "completed"

export interface Task {
  id?: string
  name: string
  description: string
  dueDate: string
  priority: Priority
  status: Status
}

export interface TaskFormProps {
  initialValues?: Task
  onSubmit: (task: Task) => void
  onCancel?: () => void
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [status, setStatus] = useState<Status>("pending")

  // Load initialValues when they change
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name)
      setDescription(initialValues.description)
      setDueDate(initialValues.dueDate)
      setPriority(initialValues.priority)
      setStatus(initialValues.status)
    }
  }, [initialValues])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id: initialValues?.id as string,
      name,
      description,
      dueDate,
      priority,
      status,
    })
    // Reset only if creating a new task
    if (!initialValues) {
      setName("")
      setDescription("")
      setDueDate("")
      setPriority("medium")
      setStatus("pending")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.title}>
        {initialValues ? "Edit Task" : "Create Task"}
      </h3>

      <div className={styles.formGroup}>
        <label htmlFor="task-name">Task Name</label>
        <input
          id="task-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="task-due">Due Date</label>
        <input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={styles.select}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="task-status">Status</label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={styles.select}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitButton}>
          {initialValues ? "Update" : "Create"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default TaskForm
