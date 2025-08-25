"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { FaPaperPlane } from "react-icons/fa"

export interface MessageInputBarProps {
  placeholder?: string
  onSend: (message: string) => void
  disabled?: boolean
  autoFocus?: boolean
  submitLabel?: string
}

/**
 * MessageInputBar provides an input and send button for chat messages.
 * It supports Enter-to-send, optional autofocus, and disabled state.
 */
const MessageInputBar: React.FC<MessageInputBarProps> = ({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
  autoFocus = false,
  submitLabel = "Send",
}) => {
  const [message, setMessage] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Autofocus input if requested
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  // Send message if valid
  const handleSend = useCallback((): void => {
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage("")
      inputRef.current?.focus()
    }
  }, [message, disabled, onSend])

  // Handle Enter key to send
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSend()
      }}
      className={`
        flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800
        p-2
      `}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex-1 rounded bg-black p-2 text-white
          focus:outline-none
        `}
        aria-label="Message input"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className={`
          flex items-center gap-2 rounded bg-green-500 px-4 py-2 text-black
          transition
          hover:bg-green-400
          disabled:opacity-50
        `}
        aria-label={submitLabel}
      >
        <FaPaperPlane aria-hidden="true" />
        <span
          className={`
            hidden
            sm:inline
          `}
        >
          {submitLabel}
        </span>
      </button>
    </form>
  )
}

export default MessageInputBar
