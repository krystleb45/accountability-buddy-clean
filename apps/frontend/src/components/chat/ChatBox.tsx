"use client"
import React, { useEffect, useRef, useState } from "react"
import { FaPlay } from "react-icons/fa"

import ChatBubble from "@/components/chat/ChatBubble"
import { useChat } from "@/context/ChatContext"
import socket from "@/utils/socket"

interface ChatBoxProps {
  chatId: string
  onSendMessage?: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

const ChatBox: React.FC<ChatBoxProps> = ({
  chatId,
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
}) => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<
    {
      id: string
      senderName: string
      content: string
      avatarUrl: string
      timestamp: string
    }[]
  >([])

  const { user } = useChat()
  const messageEndRef = useRef<HTMLDivElement>(null)

  /** Scroll to bottom when messages update */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!chatId || !user) return

    socket.emit("joinRoom", chatId)
    socket.on(
      "receiveMessage",
      (data: {
        chatId: string
        senderId: string
        senderName: string
        message: string
        timestamp: string
      }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `${data.senderId}-${new Date(data.timestamp).getTime()}`,
            senderName: data.senderName,
            content: data.message,
            avatarUrl: "/default-avatar.png",
            timestamp: data.timestamp,
          },
        ])
      },
    )

    return () => {
      socket.emit("leaveRoom", chatId)
      socket.off("receiveMessage")
    }
  }, [chatId, user])

  const handleSendMessage = () => {
    const text = message.trim()
    if (!text || !user) return

    const timestamp = new Date().toISOString()
    const newMsg = {
      id: timestamp,
      senderName: user.name,
      content: text,
      avatarUrl: user.avatarUrl || "/default-avatar.png",
      timestamp,
    }

    socket.emit("sendMessage", { chatId, message: text })
    setMessages((prev) => [...prev, newMsg])
    setMessage("")
    onSendMessage?.(text)
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-black p-4 shadow-md">
      <h2 className="mb-4 text-xl font-bold text-[#4CBB17]">Chatroom</h2>

      <div className="mb-4 flex-1 overflow-y-auto rounded-lg bg-gray-900 p-2">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isSender={msg.senderName === user?.name}
              avatarUrl={msg.avatarUrl}
              timestamp={new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
        />
        <button
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          className="rounded-lg bg-[#4CBB17] p-2 text-black transition hover:bg-green-400 disabled:opacity-50"
        >
          <FaPlay />
        </button>
      </div>
    </div>
  )
}

export default ChatBox
