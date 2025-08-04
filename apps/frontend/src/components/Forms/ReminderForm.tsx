"use client"

import { motion } from "framer-motion"
import React, { useCallback, useState } from "react"

import styles from "./ReminderForm.module.css"

export interface ReminderFormProps {
  /** ID of the goal to set a reminder for */
  goalId: string
  /** Callback invoked on valid reminder submission */
  onSave: (goalId: string, date: string, time: string) => void
}

/**
 * ReminderForm allows users to pick a date and time for a goal reminder.
 */
const ReminderForm: React.FC<ReminderFormProps> = ({ goalId, onSave }) => {
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [error, setError] = useState<string>("")

  /**
   * Validates inputs and invokes onSave.
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault()
      setError("")

      if (!date || !time) {
        setError("Please select both a date and time.")
        return
      }

      onSave(goalId, date, time)
      setDate("")
      setTime("")
    },
    [goalId, onSave, date, time],
  )

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={styles.reminderForm}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      noValidate
    >
      {error && <p className={styles.errorText}>{error}</p>}

      <div className="mb-4">
        <label htmlFor="date" className="mb-2 block text-sm text-gray-300">
          Select Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.input}
          aria-required="true"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="time" className="mb-2 block text-sm text-gray-300">
          Select Time
        </label>
        <input
          id="time"
          name="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={styles.input}
          aria-required="true"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-green-500 py-3 text-black transition hover:bg-green-400"
        aria-label="Save reminder"
      >
        Save Reminder
      </button>
    </motion.form>
  )
}

export default ReminderForm
