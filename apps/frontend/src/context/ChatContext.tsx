"use client"

import type { ReactNode } from "react"

import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
} from "react"

import socket, { connectSocket, disconnectSocket } from "@/utils/socket"

// Define message structure
interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  avatarUrl?: string
}

// Typing status structure
interface TypingStatus {
  chatId: string
  userId: string
  username: string
}

// Context value type
interface ChatContextType {
  user: { id: string; name: string; avatarUrl?: string } | null
  messages: Record<string, Message[]>
  typingUsers: TypingStatus[]
  send: (chatId: string, content: string) => void
  notifyTyping: (chatId: string) => void
  notifyStopTyping: (chatId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{
    id: string
    name: string
    avatarUrl?: string
  } | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([])

  // Initialize and disconnect socket on mount/unmount
  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (token && storedUser) {
      const parsed = JSON.parse(storedUser)
      setUser({
        id: parsed.id,
        name: parsed.name,
        avatarUrl: parsed.avatarUrl || "/default-avatar.svg",
      })
      connectSocket(token)
    }
    return () => {
      disconnectSocket()
    }
  }, [])

  // Handle incoming messages with raw payload mapping
  useEffect(() => {
    const handleReceive = (data: {
      chatId: string
      senderId: string
      senderName: string
      message: string
      timestamp: string
      avatarUrl?: string
    }) => {
      const msg: Message = {
        id: `msg-${Date.now()}`,
        chatId: data.chatId,
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.message,
        timestamp: data.timestamp,
        avatarUrl: data.avatarUrl || "/default-avatar.svg",
      }
      setMessages((prev) => ({
        ...prev,
        [msg.chatId]: [...(prev[msg.chatId] || []), msg],
      }))
    }

    socket.on("receiveMessage", handleReceive)
    return () => {
      socket.off("receiveMessage", handleReceive)
    }
  }, [])

  // Handle typing indicators
  useEffect(() => {
    const onTyping = (data: TypingStatus) => {
      setTypingUsers((prev) => [
        ...prev.filter(
          (u) => u.chatId !== data.chatId || u.userId !== data.userId,
        ),
        data,
      ])
    }
    const onStopTyping = (data: { chatId: string; userId: string }) => {
      setTypingUsers((prev) =>
        prev.filter(
          (u) => !(u.chatId === data.chatId && u.userId === data.userId),
        ),
      )
    }
    socket.on("userTyping", onTyping)
    socket.on("userStoppedTyping", onStopTyping)
    return () => {
      socket.off("userTyping", onTyping)
      socket.off("userStoppedTyping", onStopTyping)
    }
  }, [])

  // Send message helper
  const send = useCallback(
    (chatId: string, content: string) => {
      if (!user) return
      socket.emit("sendMessage", { chatId, message: content })
    },
    [user],
  )

  // Notify typing helper
  const notifyTyping = useCallback(
    (chatId: string) => {
      if (!user) return
      socket.emit("typing", { chatId, userId: user.id, username: user.name })
    },
    [user],
  )

  // Notify stop typing helper
  const notifyStopTyping = useCallback(
    (chatId: string) => {
      if (!user) return
      socket.emit("stopTyping", { chatId, userId: user.id })
    },
    [user],
  )

  return (
    <ChatContext
      value={{
        user,
        messages,
        typingUsers,
        send,
        notifyTyping,
        notifyStopTyping,
      }}
    >
      {children}
    </ChatContext>
  )
}

export function useChat(): ChatContextType {
  const ctx = use(ChatContext)
  if (!ctx) throw new Error("useChat must be used within a ChatProvider")
  return ctx
}
