// MESSAGING SYSTEM - All features included
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"

// Enhanced message interface - FIXED for exactOptionalPropertyTypes
interface AdvancedMessage {
  _id: string
  content: string
  senderId: string
  senderName: string
  createdAt: string
  updatedAt?: string | undefined
  isEdited?: boolean | undefined
  readBy?:
    | Array<{
        userId: string
        readAt: string
      }>
    | undefined
  reactions?:
    | Array<{
        userId: string
        emoji: string
        createdAt: string
      }>
    | undefined
  attachments?:
    | Array<{
        type: "image" | "file" | "video"
        url: string
        name: string
        size: number
      }>
    | undefined
  replyTo?:
    | {
        messageId: string
        content: string
        senderName: string
      }
    | undefined
}

interface ConversationThread {
  _id: string
  participants: Array<{
    _id: string
    name: string
    avatar?: string
  }>
  group?: {
    _id: string
    name: string
    avatar?: string
  }
  lastMessage?: AdvancedMessage
  unreadCount: number
  messageType: "private" | "group"
  createdAt: string
  updatedAt: string
}

interface Group {
  _id: string
  name: string
  description?: string
  members: Array<{
    _id: string
    name: string
    role: "admin" | "member"
  }>
  avatar?: string
}

export default function AdvancedMessagesClient() {
  console.log("🚀 MESSAGES COMPONENT RENDERING")

  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const friendId = searchParams.get("friendId")
  const groupId = searchParams.get("groupId")

  // Enhanced state
  const [messages, setMessages] = useState<AdvancedMessage[]>([])
  const [conversationThreads, setConversationThreads] = useState<
    ConversationThread[]
  >([])
  const [showingThreads, setShowingThreads] = useState(true)
  const [messageInput, setMessageInput] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [friendName, setFriendName] = useState("Friend")
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [filteredMessages, setFilteredMessages] = useState<AdvancedMessage[]>(
    [],
  )
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [replyingTo, setReplyingTo] = useState<AdvancedMessage | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [typingUsers] = useState<string[]>([]) // Removed setTypingUsers since it's not used

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Common emojis for reactions
  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "🔥"]

  const loadFriendName = async () => {
    try {
      const response = await fetch("/api/friends")
      if (response.ok) {
        const data = await response.json()
        const friends = data?.data?.friends || data?.friends || data || []
        const friend = friends.find((f: any) => f._id === friendId)
        if (friend) {
          setFriendName(friend.username || friend.name || "Friend")
        }
      }
    } catch (error) {
      console.error("Failed to load friend name:", error)
    }
  }

  const loadGroupInfo = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentGroup(data.data || data)
      }
    } catch (error) {
      console.error("Failed to load group info:", error)
    }
  }

  const loadMessages = async () => {
    try {
      // Build endpoint with parameters
      let endpoint = "/api/messages"
      const params = new URLSearchParams()

      if (friendId && friendId !== "null") {
        params.append("recipientId", friendId)
        setShowingThreads(false)
      }

      if (groupId && groupId !== "null") {
        params.append("groupId", groupId)
        setShowingThreads(false)
      }

      // Add query string if there are parameters
      if (params.toString()) {
        endpoint += `?${params.toString()}`
      } else {
        setShowingThreads(true)
      }

      console.log("📨 Loading messages from:", endpoint)

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()

        // Check if we got threads (no specific chat selected) or messages
        if (data?.data?.threads) {
          // We got conversation threads
          console.log("📨 Got conversation threads:", data.data.threads)
          setConversationThreads(data.data.threads)
          setMessages([])
          setShowingThreads(true)
        } else {
          // We got actual messages
          const msgs = data?.data?.messages || data?.messages || data || []
          setMessages(msgs)
          setConversationThreads([])
          setShowingThreads(false)
        }
      } else {
        console.error(
          "Failed to load messages:",
          response.status,
          response.statusText,
        )
        setMessages([])
        setConversationThreads([])
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
      setMessages([])
      setConversationThreads([])
    }
  }

  // Load initial data
  useEffect(() => {
    if (friendId) {
      loadFriendName()
      setShowingThreads(false)
    } else if (groupId) {
      loadGroupInfo()
      setShowingThreads(false)
    } else {
      setShowingThreads(true)
    }
    loadMessages()
  }, [friendId, groupId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredMessages(filtered)
    } else {
      setFilteredMessages([])
    }
  }, [searchQuery, messages])

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!messageInput.trim() && !selectedFiles) || sendingMessage) return

    setSendingMessage(true)

    try {
      const formData = new FormData()
      formData.append("content", messageInput.trim())
      formData.append(
        "messageType",
        groupId && groupId !== "null" ? "group" : "private",
      )

      // Fix: Only append if values exist and aren't 'null' string
      if (friendId && friendId !== "null") {
        formData.append("recipientId", friendId)
      }

      if (groupId && groupId !== "null") {
        formData.append("groupId", groupId)
      }

      if (replyingTo) {
        formData.append(
          "replyTo",
          JSON.stringify({
            messageId: replyingTo._id,
            content: `${replyingTo.content.substring(0, 50)}...`,
            senderName: replyingTo.senderName,
          }),
        )
      }

      // Add files - Check if file exists before appending
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          if (file) {
            formData.append("files", file)
          }
        }
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const newMessage = result.data || result

        // Create proper attachments array or undefined
        const attachments = selectedFiles
          ? Array.from(selectedFiles)
              .filter((file) => file)
              .map((file) => ({
                type: file.type.startsWith("image/")
                  ? ("image" as const)
                  : file.type.startsWith("video/")
                    ? ("video" as const)
                    : ("file" as const),
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
              }))
          : undefined

        // Add message to display
        const displayMessage: AdvancedMessage = {
          _id: newMessage._id || Date.now().toString(),
          content: messageInput.trim(),
          senderId: session?.user?.id || "me",
          senderName: session?.user?.name || "You",
          createdAt: new Date().toISOString(),
          attachments,
          replyTo: replyingTo
            ? {
                messageId: replyingTo._id,
                content: `${replyingTo.content.substring(0, 50)}...`,
                senderName: replyingTo.senderName,
              }
            : undefined,
        }

        setMessages((prev) => [...prev, displayMessage])
        setMessageInput("")
        setSelectedFiles(null)
        setReplyingTo(null)

        // Mark as read for sender
        markAsRead(displayMessage._id)
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("❌ Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      })

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  content: newContent,
                  isEdited: true,
                  updatedAt: new Date().toISOString(),
                }
              : msg,
          ),
        )
        setEditingMessage(null)
        setEditText("")
      }
    } catch (error) {
      console.error("Failed to edit message:", error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId))
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      })

      if (response.ok) {
        const updatedMessage = await response.json()
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? updatedMessage.data : msg,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to add reaction:", error)
    } finally {
      setShowEmojiPicker(null)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      setSelectedFiles(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
  }

  const getDisplayName = () => {
    if (showingThreads) return "Conversations"
    if (currentGroup) return currentGroup.name
    return friendName
  }

  const getSubtitle = () => {
    if (showingThreads) {
      const totalUnread = conversationThreads.reduce(
        (sum, thread) => sum + thread.unreadCount,
        0,
      )
      return `${conversationThreads.length} conversations • ${totalUnread} unread`
    }
    if (currentGroup) {
      return `${currentGroup.members.length} members`
    }
    return `Private message • ${messages.length} messages`
  }

  const getTotalUnreadCount = () => {
    return conversationThreads.reduce(
      (sum, thread) => sum + thread.unreadCount,
      0,
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        {/* Enhanced Sidebar */}
        <div className="flex w-1/3 flex-col border-r border-gray-700 bg-gray-900">
          <div className="border-b border-gray-700 p-4">
            <Link
              href="/community"
              className="mb-4 inline-flex items-center text-green-400 hover:text-green-300"
            >
              ← Back to Community
            </Link>
            <h1 className="text-2xl font-bold text-green-400">💬 Messages</h1>
            <p className="mt-2 text-sm text-gray-400">
              💬{" "}
              {showingThreads
                ? "All Conversations"
                : `Chatting with ${getDisplayName()}`}
            </p>

            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
            >
              🔍 Search Messages
            </button>
          </div>

          {/* Search Panel */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-700 p-4"
              >
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
                />

                {filteredMessages.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    <p className="mb-2 text-xs text-gray-400">
                      Found {filteredMessages.length} messages:
                    </p>
                    {filteredMessages.map((msg) => (
                      <div
                        key={msg._id}
                        className="mb-1 rounded bg-gray-800 p-2 text-xs"
                      >
                        <span className="text-green-400">
                          {msg.senderName}:
                        </span>{" "}
                        {msg.content.substring(0, 50)}...
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 p-4">
            <div className="text-center text-gray-400">
              <div className="mb-4 text-4xl">💬</div>
              <p>Chat Features</p>
              <p className="mt-2 text-xs">
                {showingThreads
                  ? `Conversations: ${conversationThreads.length} • Unread: ${getTotalUnreadCount()}`
                  : `Messages: ${messages.length}`}
              </p>
              {currentGroup && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-green-400">
                    Group Members:
                  </p>
                  {currentGroup.members.map((member) => (
                    <div key={member._id} className="mt-1 text-xs">
                      {member.name} {member.role === "admin" && "👑"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Main Chat Area */}
        <div className="flex flex-1 flex-col">
          {/* Feature Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 text-center font-bold text-white">
            💬 Edit • Delete • React • Search • Files • Groups 📎
          </div>

          {/* Enhanced Chat Header */}
          <div className="border-b border-gray-700 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 font-bold text-white">
                  {getDisplayName()[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <h2 className="font-bold text-white">{getDisplayName()}</h2>
                  <p className="text-sm text-gray-400">{getSubtitle()}</p>
                  {typingUsers.length > 0 && (
                    <p className="text-xs text-green-400">
                      {typingUsers.join(", ")}{" "}
                      {typingUsers.length === 1 ? "is" : "are"} typing...
                    </p>
                  )}
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex space-x-2">
                {!showingThreads && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                  >
                    📎 Files
                  </button>
                )}
                {currentGroup && (
                  <button className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-500">
                    👥 Members
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Messages Area */}
          <div
            className={`flex-1 overflow-y-auto bg-gray-800 p-4 ${isDragging ? "border-2 border-dashed border-green-400 bg-gray-700" : ""}`}
            style={{ height: "calc(100vh - 240px)" }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="mb-4 text-center text-green-400">
                <div className="mb-2 text-4xl">📁</div>
                <p>Drop files here to upload</p>
              </div>
            )}

            {/* Show conversation threads when no specific chat is selected */}
            {showingThreads ? (
              <div className="space-y-4">
                <h3 className="mb-4 text-xl font-bold text-green-400">
                  💬 Your Conversations
                </h3>

                {conversationThreads.length === 0 ? (
                  <div className="mt-8 text-center text-gray-400">
                    <div className="mb-4 text-4xl">💬</div>
                    <h3 className="mb-2 text-xl font-bold text-green-400">
                      No conversations yet
                    </h3>
                    <p>
                      Start a conversation by visiting your friends or groups
                    </p>
                    <div className="mt-4 space-y-2">
                      <Link
                        href="/community"
                        className="mr-2 inline-block rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-500"
                      >
                        Browse Community
                      </Link>
                      <Link
                        href="/friends"
                        className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500"
                      >
                        View Friends
                      </Link>
                    </div>
                  </div>
                ) : (
                  conversationThreads.map((thread, index) => (
                    <motion.div
                      key={thread._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="cursor-pointer rounded-lg bg-gray-700 p-4 transition hover:bg-gray-600"
                      onClick={() => {
                        // Navigate to specific conversation
                        if (
                          thread.messageType === "private" &&
                          thread.participants.length > 0
                        ) {
                          const recipientId = thread.participants[0]?._id
                          if (recipientId) {
                            router.push(`/messages?friendId=${recipientId}`)
                          }
                        } else if (
                          thread.messageType === "group" &&
                          thread.group
                        ) {
                          router.push(`/messages?groupId=${thread.group._id}`)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 font-bold text-white">
                            {thread.messageType === "group"
                              ? (thread.group?.name || "G")[0]?.toUpperCase() ||
                                "G"
                              : (thread.participants[0]?.name ||
                                  "U")[0]?.toUpperCase() || "U"}
                          </div>

                          {/* Conversation info */}
                          <div className="flex-1">
                            <h4 className="font-bold text-white">
                              {thread.messageType === "group"
                                ? thread.group?.name || "Group Chat"
                                : thread.participants[0]?.name ||
                                  "Unknown User"}
                            </h4>

                            {/* Last message preview */}
                            {thread.lastMessage && (
                              <p className="truncate text-sm text-gray-400">
                                {thread.lastMessage.content ||
                                  "No message content"}
                              </p>
                            )}

                            {/* Timestamp */}
                            {thread.lastMessage && (
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  thread.lastMessage.createdAt,
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Unread count */}
                        {thread.unreadCount > 0 && (
                          <div className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                            {thread.unreadCount}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              /* Regular messages display when a specific chat is selected */
              <>
                {messages.length === 0 ? (
                  <div className="mt-8 text-center text-gray-400">
                    <div className="mb-4 text-4xl">💬</div>
                    <h3 className="mb-2 text-xl font-bold text-green-400">
                      Start your conversation!
                    </h3>
                    <p>Send a message to {getDisplayName()}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${message._id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`group relative max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                            message.senderId === session?.user?.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-white"
                          }`}
                        >
                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className="mb-2 rounded bg-gray-600 p-2 text-xs">
                              <p className="text-gray-300">
                                Replying to {message.replyTo.senderName}:
                              </p>
                              <p className="text-gray-200">
                                {message.replyTo.content}
                              </p>
                            </div>
                          )}

                          {/* Message Content */}
                          {editingMessage === message._id ? (
                            <div>
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full rounded bg-gray-800 p-1 text-white"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleEditMessage(message._id, editText)
                                  }
                                }}
                                autoFocus
                              />
                              <div className="mt-1 space-x-2">
                                <button
                                  onClick={() =>
                                    handleEditMessage(message._id, editText)
                                  }
                                  className="rounded bg-green-500 px-2 py-1 text-xs text-white"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingMessage(null)}
                                  className="rounded bg-gray-500 px-2 py-1 text-xs text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{message.content}</p>

                              {/* Attachments */}
                              {message.attachments &&
                                message.attachments.map((attachment, i) => (
                                  <div key={i} className="mt-2">
                                    {attachment.type === "image" ? (
                                      <img
                                        src={attachment.url}
                                        alt={attachment.name}
                                        className="h-auto max-w-full cursor-pointer rounded"
                                        onClick={() =>
                                          window.open(attachment.url, "_blank")
                                        }
                                      />
                                    ) : (
                                      <div className="flex items-center space-x-2 rounded bg-gray-600 p-2">
                                        <span>📎</span>
                                        <div className="flex-1">
                                          <p className="text-sm">
                                            {attachment.name}
                                          </p>
                                          <p className="text-xs text-gray-300">
                                            {formatFileSize(attachment.size)}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() =>
                                            window.open(
                                              attachment.url,
                                              "_blank",
                                            )
                                          }
                                          className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                                        >
                                          Download
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                            </>
                          )}

                          {/* Message Footer */}
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-xs opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                              {message.isEdited && " (edited)"}
                            </p>

                            {/* Read Receipts */}
                            {message.readBy && message.readBy.length > 0 && (
                              <div className="text-xs opacity-70">
                                ✓✓ {message.readBy.length}
                              </div>
                            )}
                          </div>

                          {/* Reactions */}
                          {message.reactions &&
                            message.reactions.length > 0 && (
                              <div className="mt-2 flex space-x-1">
                                {message.reactions.map((reaction, i) => (
                                  <button
                                    key={i}
                                    onClick={() =>
                                      handleReaction(
                                        message._id,
                                        reaction.emoji,
                                      )
                                    }
                                    className="rounded bg-gray-600 px-1 py-0.5 text-xs hover:bg-gray-500"
                                  >
                                    {reaction.emoji}
                                  </button>
                                ))}
                              </div>
                            )}

                          {/* Message Actions (hover) */}
                          {message.senderId === session?.user?.id && (
                            <div className="absolute -top-8 right-0 hidden space-x-1 rounded bg-gray-800 p-1 group-hover:flex">
                              <button
                                onClick={() => {
                                  setEditingMessage(message._id)
                                  setEditText(message.content)
                                }}
                                className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-400"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-400"
                              >
                                🗑️
                              </button>
                            </div>
                          )}

                          {/* Universal Actions */}
                          <div className="absolute -top-8 left-0 hidden space-x-1 rounded bg-gray-800 p-1 group-hover:flex">
                            <button
                              onClick={() => setReplyingTo(message)}
                              className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-500"
                            >
                              ↩️
                            </button>
                            <button
                              onClick={() => setShowEmojiPicker(message._id)}
                              className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-500"
                            >
                              😀
                            </button>
                          </div>

                          {/* Emoji Picker */}
                          {showEmojiPicker === message._id && (
                            <div className="absolute left-0 top-full z-10 mt-1 flex space-x-1 rounded bg-gray-800 p-2">
                              {commonEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleReaction(message._id, emoji)
                                  }
                                  className="rounded p-1 hover:bg-gray-700"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Enhanced Message Input - Only show when not viewing threads */}
          {!showingThreads && (
            <div className="border-t border-gray-700 bg-gray-900 p-4">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="mb-2 flex items-center justify-between rounded bg-gray-800 p-2">
                  <div className="text-sm">
                    <p className="text-gray-400">
                      Replying to {replyingTo.senderName}:
                    </p>
                    <p className="text-white">
                      {replyingTo.content.substring(0, 50)}...
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* File Preview */}
              {selectedFiles && (
                <div className="mb-2 rounded bg-gray-800 p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Selected files:
                    </span>
                    <button
                      onClick={() => setSelectedFiles(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  {Array.from(selectedFiles).map((file, i) => (
                    <div key={i} className="mb-1 text-xs text-gray-300">
                      📎 {file.name} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`💬 Message ${getDisplayName()}...`}
                  disabled={sendingMessage}
                  className="flex-1 rounded-lg border-2 border-green-400 bg-gray-800 px-4 py-3 text-white focus:border-green-300 focus:outline-none disabled:opacity-50"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-500"
                >
                  📎
                </button>

                <button
                  type="submit"
                  disabled={
                    (!messageInput.trim() && !selectedFiles) || sendingMessage
                  }
                  className="rounded-lg bg-green-600 px-6 py-3 font-bold text-white transition hover:bg-green-500 disabled:bg-gray-600"
                >
                  {sendingMessage ? "Sending..." : "Send"}
                </button>
              </form>

              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500">
                Session: {session?.user?.name || "Loading..."} |
                {friendId ? ` Friend: ${friendId}` : ` Group: ${groupId}`} |
                Messages: {messages.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
