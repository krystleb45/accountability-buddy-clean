"use client"

import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react" // Removed unused Emoji import
import React, { useCallback, useEffect, useRef, useState } from "react"

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

/**
 * EmojiPicker component wraps @emoji-mart/react Picker
 * and returns the native emoji string via onSelect callback.
 */
const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  const [showPicker, setShowPicker] = useState<boolean>(false)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  // Toggle picker visibility
  const togglePicker = useCallback(() => {
    setShowPicker((prev) => !prev)
  }, [])

  // Handle emoji selection
  const handleSelect = useCallback(
    (emoji: { native: string }) => {
      onSelect(emoji.native)
      setShowPicker(false)
    },
    [onSelect],
  )

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <button
        type="button"
        onClick={togglePicker}
        aria-label={showPicker ? "Close emoji picker" : "Open emoji picker"}
        className="rounded bg-gray-200 p-2 focus:outline-none focus:ring"
      >
        😊
      </button>

      {showPicker && (
        <div className="absolute bottom-full left-0 z-50 mb-2 rounded-lg bg-white shadow-lg">
          <Picker data={data} onEmojiSelect={handleSelect} />
        </div>
      )}
    </div>
  )
}

export default EmojiPicker
