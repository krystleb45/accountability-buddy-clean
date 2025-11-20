/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
"use client"

import { Loader, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"

interface Props {
  isOpen: boolean
  onOpenChange: (_open: boolean) => void
  isSubmitting?: boolean
  onSubmit: (mood: number, note?: string) => void
  sessionId: string
}

const MOOD_OPTIONS = [
  {
    value: 1,
    emoji: "😞",
    label: "Really struggling",
    color: "text-red-500",
  },
  {
    value: 2,
    emoji: "😕",
    label: "Having a tough day",
    color: "text-orange-500",
  },
  { value: 3, emoji: "😐", label: "Getting by", color: "text-chart-3" },
  { value: 4, emoji: "😊", label: "Doing well", color: "text-green-500" },
  { value: 5, emoji: "😄", label: "Feeling great", color: "text-primary" },
]

export function MoodCheckInDialog({
  isOpen,
  onOpenChange,
  isSubmitting = false,
  onSubmit,
}: Props) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [showNote, setShowNote] = useState(false)

  const reset = () => {
    setSelectedMood(null)
    setNote("")
    setShowNote(false)
  }

  useEffect(() => {
    if (isOpen) {
      return
    }

    // Reset state when modal closes
    reset()
  }, [isOpen])

  const handleSubmit = () => {
    if (selectedMood) {
      onSubmit(selectedMood, note || undefined)
    }
  }

  const selectedMoodOption = MOOD_OPTIONS.find(
    (option) => option.value === selectedMood,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daily Check-In</DialogTitle>
          <DialogDescription>How are you feeling today?</DialogDescription>
        </DialogHeader>

        <p>Select how you're feeling:</p>

        <div className="space-y-3">
          {MOOD_OPTIONS.map((option) => (
            <Button
              type="button"
              key={option.value}
              onClick={() => setSelectedMood(option.value)}
              className={cn("flex h-auto w-full justify-start text-left", {
                "border-primary": selectedMood === option.value,
              })}
              variant="outline"
            >
              <span className="text-3xl">{option.emoji}</span>
              <div>
                <div
                  className={`
                    text-base font-medium
                    ${option.color}
                  `}
                >
                  {option.label}
                </div>
                <div className="text-sm font-normal text-muted-foreground">
                  Mood level {option.value}/5
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Mood feedback */}
        {selectedMoodOption && (
          <Card className="gap-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedMoodOption.emoji}</span>
                <span className={selectedMoodOption.color}>
                  {selectedMoodOption.label}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
              {selectedMoodOption.value <= 2 && (
                <div>
                  <p className="mb-2 text-base font-medium text-destructive">
                    Remember, you're not alone.
                  </p>
                  <p>
                    If you're in crisis, please reach out:
                    <br />
                    <strong>
                      Veterans Crisis Line:{" "}
                      <a href="tel:988" className="underline">
                        988 (Press 1)
                      </a>
                    </strong>
                  </p>
                </div>
              )}

              {selectedMoodOption.value === 3 && (
                <p>
                  Some days are harder than others. Consider connecting with
                  others in our chat rooms.
                </p>
              )}

              {selectedMoodOption.value >= 4 && (
                <p>
                  Great to hear you're doing well! Consider sharing your
                  positivity with others in our community.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Optional Note Section */}
        <div className="my-2">
          {showNote ? (
            <div className="space-y-3">
              <Label>Anything you'd like to share anonymously?</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="This helps us understand how our community is doing..."
                className="w-full resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground">
                {note.length}/500 characters • This is completely anonymous
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowNote(true)} variant="link">
              <MessageCircle />
              <span className="text-sm">Add an anonymous note (optional)</span>
            </Button>
          )}
        </div>

        <DialogFooter className="sm:*:flex-1">
          <DialogClose asChild>
            <Button variant="outline">Skip for now</Button>
          </DialogClose>
          <Button
            disabled={!selectedMood || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>

        <p className="text-xs text-pretty text-muted-foreground">
          Your check-in is completely anonymous and helps us support our
          community better.
        </p>
      </DialogContent>
    </Dialog>
  )
}
