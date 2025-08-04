// src/components/MilitarySupport/MoodCheckInModal.tsx

"use client"

import { Heart, MessageCircle, X } from "lucide-react"
import React, { useEffect, useState } from "react"

interface MoodOption {
  value: number
  emoji: string
  label: string
  color: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (mood: number, note?: string) => Promise<void>
  sessionId: string
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: "😞", label: "Really struggling", color: "text-red-500" },
  {
    value: 2,
    emoji: "😕",
    label: "Having a tough day",
    color: "text-orange-500",
  },
  { value: 3, emoji: "😐", label: "Getting by", color: "text-yellow-500" },
  { value: 4, emoji: "😊", label: "Doing well", color: "text-green-500" },
  { value: 5, emoji: "😄", label: "Feeling great", color: "text-emerald-500" },
]

export default function MoodCheckInModal({ isOpen, onClose, onSubmit }: Props) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSelectedMood(null)
      setNote("")
      setShowNote(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (selectedMood === null) return

    try {
      setIsSubmitting(true)
      await onSubmit(selectedMood, note.trim() || undefined)
      onClose()
    } catch (error) {
      console.error("Failed to submit mood check-in:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  if (!isOpen) return null

  const selectedMoodOption = MOOD_OPTIONS.find(
    (option) => option.value === selectedMood,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="relative rounded-t-lg bg-blue-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white transition-colors hover:text-gray-200"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center space-x-3">
            <Heart className="size-6" />
            <div>
              <h2 className="text-xl font-bold">Daily Check-In</h2>
              <p className="text-sm text-blue-100">
                How are you feeling today?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Mood Selection */}
          <div className="mb-6 space-y-4">
            <p className="font-medium text-gray-700">
              Select how you're feeling:
            </p>

            <div className="space-y-3">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMood(option.value)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 hover:shadow-md ${
                    selectedMood === option.value
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <div className={`font-medium ${option.color}`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500">
                        Mood level {option.value}/5
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Mood Feedback */}
          {selectedMoodOption && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="mb-3 flex items-center space-x-3">
                <span className="text-2xl">{selectedMoodOption.emoji}</span>
                <span className={`font-medium ${selectedMoodOption.color}`}>
                  {selectedMoodOption.label}
                </span>
              </div>

              {selectedMoodOption.value <= 2 && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-gray-600">
                  <p className="mb-1 font-medium text-red-800">
                    Remember, you're not alone.
                  </p>
                  <p>
                    If you're in crisis, please reach out:{" "}
                    <strong>Veterans Crisis Line: 988 (Press 1)</strong>
                  </p>
                </div>
              )}

              {selectedMoodOption.value === 3 && (
                <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-gray-600">
                  <p>
                    Some days are harder than others. Consider connecting with
                    others in our chat rooms.
                  </p>
                </div>
              )}

              {selectedMoodOption.value >= 4 && (
                <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-gray-600">
                  <p>
                    Great to hear you're doing well! Consider sharing your
                    positivity with others in our community.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Optional Note Section */}
          <div className="mb-6">
            {!showNote ? (
              <button
                onClick={() => setShowNote(true)}
                className="flex items-center space-x-2 text-blue-600 transition-colors hover:text-blue-700"
              >
                <MessageCircle className="size-4" />
                <span className="text-sm">
                  Add an anonymous note (optional)
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Anything you'd like to share anonymously?
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="This helps us understand how our community is doing..."
                  className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500">
                  {note.length}/500 characters • This is completely anonymous
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedMood === null || isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Check-In"}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Your check-in is completely anonymous and helps us support our
            community better.
          </p>
        </div>
      </div>
    </div>
  )
}
