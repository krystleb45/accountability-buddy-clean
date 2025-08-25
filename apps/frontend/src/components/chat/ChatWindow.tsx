"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { FaPause, FaPlay } from "react-icons/fa"

import { useChat } from "@/context/ChatContext"
import socket, { markMessageAsRead } from "@/utils/socket"

import { formatTimestamp } from "../../utils/ChatUtils"
import EmojiPicker from "./EmojiPicker"

// Define message structure
interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  status?: "sent" | "seen"
  reactions?: { emoji: string }[]
}

interface ChatWindowProps {
  chatId: string
  currentUserId: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, currentUserId }) => {
  const { messages, send, notifyTyping, notifyStopTyping } = useChat()
  const [message, setMessage] = useState<string>("")
  const [typingStatus, setTypingStatus] = useState<string>("")
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chatWindowRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  // Get typed messages for current chat
  const chatMessages = (messages[chatId] || []) as ChatMessage[]

  // Auto-scroll when messages update
  useEffect(() => {
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [chatMessages])

  // Setup socket listeners
  useEffect(() => {
    if (chatId) socket.emit("joinRoom", chatId)

    socket.on(
      "userTyping",
      (typingData: { chatId: string; username: string }) => {
        if (typingData.chatId === chatId)
          setTypingStatus(`${typingData.username} is typing...`)
      },
    )
    socket.on("userStoppedTyping", (stopData: { chatId: string }) => {
      if (stopData.chatId === chatId) setTypingStatus("")
    })
    socket.on(
      "messageRead",
      (_readData: { chatId: string; messageId: string; userId: string }) => {
        // Optional read receipt handling
      },
    )

    return () => {
      if (chatId) socket.emit("leaveRoom", chatId)
      socket.off("userTyping")
      socket.off("userStoppedTyping")
      socket.off("messageRead")
      audioRef.current?.pause()
    }
  }, [chatId])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setSelectedMessage(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const scrollToBottom = useCallback(() => {
    chatWindowRef.current?.scrollTo({
      top: chatWindowRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [])

  const handleSendMessage = useCallback((): void => {
    const text = message.trim()
    if (!text) return
    send(chatId, text)
    setMessage("")
    scrollToBottom()
  }, [chatId, message, send, scrollToBottom])

  const handleTyping = useCallback((): void => {
    notifyTyping(chatId)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = window.setTimeout(
      () => notifyStopTyping(chatId),
      2000,
    )
  }, [chatId, notifyTyping, notifyStopTyping])

  const handleViewMessage = useCallback(
    (messageId: string): void => {
      markMessageAsRead(chatId, messageId, currentUserId)
    },
    [chatId, currentUserId],
  )

  const toggleAudio = useCallback(
    (src: string): void => {
      if (playingAudio === src) {
        audioRef.current?.pause()
        setPlayingAudio(null)
      } else {
        audioRef.current?.pause()
        const newAudio = new Audio(src)
        audioRef.current = newAudio
        setPlayingAudio(src)
        newAudio.play().catch(() => {})
        newAudio.onended = () => setPlayingAudio(null)
      }
    },
    [playingAudio],
  )

  const handleAddReaction = useCallback(
    (messageId: string, emoji: string): void => {
      socket.emit("addReaction", { chatId, messageId, reaction: emoji })
    },
    [chatId],
  )

  const highlightMentions = (text: string): React.ReactNode[] => {
    return text.split(/(@\w+)/g).map((part, idx) =>
      part.startsWith("@") ? (
        <span key={idx} className="font-bold text-blue-400">
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      ),
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && message.trim()) handleSendMessage()
  }

  return (
    <div className="flex flex-col rounded-2xl bg-gray-900 p-4 shadow-lg">
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className={`
          flex-1 overflow-y-auto rounded-lg border border-gray-700 p-2
        `}
        ref={chatWindowRef}
      >
        {chatMessages.length > 0 ? (
          chatMessages.map((msg) => {
            const { content, status, reactions = [] } = msg
            const isAudio = content.endsWith(".webm")
            const isFile = /^https?:\/\//.test(content)

            return (
              <div
                key={msg.id}
                className={`
                  mb-3 rounded-lg p-2
                  ${
                    msg.senderId === currentUserId
                      ? `bg-green-700 text-right`
                      : `bg-gray-800 text-left`
                  }
                `}
                onMouseEnter={() => handleViewMessage(msg.id)}
              >
                <strong className="text-green-400">{msg.senderName}:</strong>{" "}
                {isAudio ? (
                  <button onClick={() => toggleAudio(content)} className="ml-2">
                    {playingAudio === content ? <FaPause /> : <FaPlay />}
                  </button>
                ) : isFile ? (
                  content.match(/\.(jpe?g|png|gif)$/i) ? (
                    <img
                      src={content}
                      alt="attachment"
                      className="size-32 rounded-lg"
                    />
                  ) : content.match(/\.(mp4|webm)$/i) ? (
                    <video controls className="w-32 rounded-lg">
                      <source src={content} type="video/webm" />
                      <track kind="captions" src="" default />
                      Your browser does not support video.
                    </video>
                  ) : (
                    <a
                      href={content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      Download File
                    </a>
                  )
                ) : (
                  highlightMentions(content)
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {formatTimestamp(new Date(msg.timestamp))}
                </p>
                {msg.senderId === currentUserId && (
                  <p className="text-xs text-gray-400">
                    {status === "seen" ? "✓✓ Seen" : "✓ Sent"}
                  </p>
                )}
                <button
                  onClick={() => setSelectedMessage(msg.id)}
                  className="ml-2 text-gray-400"
                >
                  😊
                </button>
                {selectedMessage === msg.id && (
                  <div
                    ref={pickerRef}
                    className={`
                      absolute bottom-full left-0 z-50 rounded-lg bg-white p-2
                      shadow-lg
                    `}
                  >
                    <EmojiPicker
                      onSelect={(emoji) => handleAddReaction(msg.id, emoji)}
                    />
                  </div>
                )}
                {reactions.length > 0 && (
                  <div className="mt-1 flex gap-2">
                    {reactions.map((r, i) => (
                      <span key={i} className="text-lg">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
      </div>

      {typingStatus && (
        <p className="text-center text-gray-400">{typingStatus}</p>
      )}

      <div className="mt-3 flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyUp={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className={`
            flex-1 rounded-lg border border-gray-700 bg-black p-2 text-white
          `}
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className={`
            rounded-lg bg-green-500 px-4 py-2 text-black transition
            hover:bg-green-400
            disabled:opacity-50
          `}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWindow
