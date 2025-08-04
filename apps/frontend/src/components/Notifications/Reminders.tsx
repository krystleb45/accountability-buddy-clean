import axios from "axios"
import React, { useEffect, useState } from "react"

import "./Reminder.css" // Optional: Custom CSS for styling

// Define the Reminder interface
interface Reminder {
  id: string
  message: string
  time: string
}

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [newReminder, setNewReminder] = useState<{
    message: string
    time: string
  }>({
    message: "",
    time: "",
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  // Fetch reminders on component mount
  useEffect(() => {
    const fetchReminders = async (): Promise<void> => {
      setLoading(true)
      setError("")
      try {
        const response = await axios.get<Reminder[]>(
          `${process.env.REACT_APP_API_URL}/reminders`,
        )
        setReminders(response.data)
      } catch (err: unknown) {
        console.error("Error fetching reminders:", err)
        setError("Failed to fetch reminders. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

  // Handle input changes for the new reminder form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setNewReminder((prev) => ({ ...prev, [name]: value }))
  }

  // Handle saving a new reminder
  const handleSaveReminder = async (): Promise<void> => {
    if (!newReminder.message || !newReminder.time) {
      setError("Please provide a message and time for the reminder.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await axios.post<Reminder>(
        `${process.env.REACT_APP_API_URL}/reminders`,
        newReminder,
      )
      setReminders((prev) => [...prev, response.data])
      setNewReminder({ message: "", time: "" }) // Reset the form
    } catch (err: unknown) {
      console.error("Error saving reminder:", err)
      setError("Failed to save reminder. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Handle deleting a reminder
  // Handle deleting a reminder
  const handleDeleteReminder = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/reminders/${id}`)
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
    } catch (err: unknown) {
      console.error("Error deleting reminder:", err)
      setError("Failed to delete reminder. Please try again.")
    }
  }

  return (
    <div className="reminders">
      <h2>Reminders</h2>
      {loading ? (
        <p>Loading reminders...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <ul className="reminder-list">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="reminder-item">
              <p className="reminder-message">{reminder.message}</p>
              <p className="reminder-time">
                {new Date(reminder.time).toLocaleString()}
              </p>
              <button
                onClick={() => handleDeleteReminder(reminder.id)}
                className="delete-button"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="new-reminder-form">
        <h3>Add a New Reminder</h3>
        <input
          type="text"
          name="message"
          placeholder="Reminder message"
          value={newReminder.message}
          onChange={handleInputChange}
          className="input"
        />
        <input
          type="datetime-local"
          name="time"
          value={newReminder.time}
          onChange={handleInputChange}
          className="input"
        />
        <button
          onClick={handleSaveReminder}
          disabled={saving}
          className="save-button"
        >
          {saving ? "Saving..." : "Save Reminder"}
        </button>
      </div>
    </div>
  )
}

export default Reminders
