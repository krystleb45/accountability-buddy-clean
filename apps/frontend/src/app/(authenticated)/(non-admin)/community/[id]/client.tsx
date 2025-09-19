// src/app/community/[id]/client.tsx
"use client"

import type { ChangeEvent } from "react"

import { useSession } from "next-auth/react"
import React, { useEffect, useRef, useState } from "react"

import type { Community } from "@/api/community/community-api"
import type { Message } from "@/api/messages/messageApi"

import { fetchMessages, sendMessage } from "@/api/messages/messageApi"
import socket from "@/utils/socket"

interface Props {
  community: Community
}

export default function ClientCommunityDetail({ community }: Props) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load initial messages and subscribe to real-time updates
  useEffect(() => {
    async function loadMessages(): Promise<void> {
      try {
        const msgs = await fetchMessages(community._id)
        setMessages(msgs)
      } catch (err) {
        console.error("Failed to load messages:", err)
      }
    }
    loadMessages()

    // Ensure we imported socket from '@/utils/socket', not messageApi
    socket.emit("joinRoom", community._id)
    socket.on("receiveMessage", (data) => {
      // data already typed via ServerToClientEvents in socket.ts
      const msg: Message = {
        _id: data.timestamp + data.senderId,
        communityId: community._id,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.message,
        createdAt: data.timestamp,
      }
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.off("receiveMessage")
      socket.emit("leaveRoom", community._id)
    }
  }, [community._id])

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || !userId) return
    try {
      const newMsg = await sendMessage(community._id, input, userId)
      setInput("")
      setMessages((prev) => [...prev, newMsg])
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        {community.name}
      </h1>
      <p className="mb-6 text-gray-600">{community.description}</p>

      <div className="flex-1 space-y-2 overflow-y-auto bg-white p-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`
              flex items-start
              ${msg.senderId === userId ? `justify-end` : ""}
            `}
          >
            <div
              className={`
                max-w-xs rounded-lg p-2
                ${msg.senderId === userId ? "bg-blue-200" : "bg-gray-200"}
              `}
            >
              <p className="text-sm font-semibold text-gray-800">
                {msg.senderName}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-gray-700">
                {msg.content}
              </p>
              <p className="mt-1 text-right text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border p-2"
        />
        <button
          onClick={handleSend}
          className={`
            rounded bg-green-500 px-4 py-2 text-white
            hover:bg-green-600
          `}
        >
          Send
        </button>
      </div>
    </div>
  )
}
