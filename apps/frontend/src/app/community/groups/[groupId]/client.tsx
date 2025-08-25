// src/app/community/groups/[groupId]/client.tsx - CLEAN VERSION
"use client"

import { AnimatePresence, motion } from "motion/react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaComments,
  FaCrown,
  FaExclamationTriangle,
  FaGlobe,
  FaLock,
  FaPaperPlane,
  FaTimes,
  FaUsers,
} from "react-icons/fa"

import { http } from "@/utils"

interface Group {
  _id: string
  name: string
  description: string
  category: string
  privacy: "public" | "private"
  memberCount: number
  createdBy: {
    _id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

interface Member {
  _id: string
  username: string
  email: string
  role: string
  joinedAt: string
}

interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    username: string
  }
  createdAt: string
  updatedAt: string
}

export default function GroupDetailClient() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  const loadGroupData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🚀 [CLIENT] Loading group data for:", groupId)
      console.log("🔍 [CLIENT] Session data:", {
        user: session?.user?.email,
        hasAccessToken: !!(session?.user as any)?.accessToken,
        tokenPreview: `${(session?.user as any)?.accessToken?.substring(0, 20)}...`,
      })

      // Load all data in parallel
      const [groupResponse, membersResponse, messagesResponse] =
        await Promise.all([
          http.get(`/groups/${groupId}`).catch((err) => {
            console.error(`❌ [CLIENT] Failed to load group data:`, err)
            throw new Error(`Failed to load group data: ${err.message}`)
          }),
          http.get(`/groups/${groupId}/members`).catch((err) => {
            console.error(`❌ [CLIENT] Failed to load members data:`, err)
            return null
          }),
          http.get(`/groups/${groupId}/messages`).catch((err) => {
            console.error(`❌ [CLIENT] Failed to load messages data:`, err)
            return null
          }),
        ])

      // Handle group details
      const groupData = groupResponse.data
      console.log("✅ [CLIENT] Group data loaded:", groupData)

      // Try different response formats
      const group = groupData.data || groupData.group || groupData
      console.log("🔍 [CLIENT] Extracted group:", group)
      setGroup(group)

      // Handle members
      if (membersResponse) {
        const membersData = membersResponse.data
        console.log("✅ [CLIENT] Members data loaded:", membersData)

        // Try different response formats
        const members =
          membersData.data || membersData.members || membersData || []
        console.log("🔍 [CLIENT] Extracted members:", members)
        setMembers(Array.isArray(members) ? members : [])
      }

      if (messagesResponse) {
        // Handle messages
        const messagesData = messagesResponse.data
        console.log("✅ [CLIENT] Messages data loaded:", messagesData)

        // Try different response formats
        const messages =
          messagesData.data || messagesData.messages || messagesData || []
        console.log("🔍 [CLIENT] Extracted messages:", messages)
        setMessages(Array.isArray(messages) ? messages : [])
      }
    } catch (err: any) {
      console.error("💥 [CLIENT] Error loading group data:", err)
      setError(err.message || "Failed to load group details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status !== "authenticated" || !groupId) {
      setLoading(false)
      return
    }

    loadGroupData()
  }, [status, groupId])

  // Auto-hide messages
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
    return undefined // Explicitly return undefined when no cleanup needed
  }, [successMessage, error])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || sendingMessage) {
      return
    }

    try {
      setSendingMessage(true)
      console.log("🚀 [CLIENT] Sending message:", newMessage)

      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      })

      console.log("📥 [CLIENT] Send message response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message || `Failed to send message: ${response.status}`,
        )
      }

      const messageData = await response.json()
      console.log("✅ [CLIENT] Message sent successfully:", messageData)

      // Add new message to the list
      const newMessageObj = messageData.data || messageData
      setMessages((prev) => [...prev, newMessageObj])
      setNewMessage("")
      setSuccessMessage("Message sent! 📨")
    } catch (err: any) {
      console.error("💥 [CLIENT] Failed to send message:", err)
      setError(err.message || "Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div
        className={`
          flex min-h-screen items-center justify-center bg-gradient-to-br
          from-gray-900 via-gray-800 to-black
        `}
      >
        <div className="text-center">
          <div
            className={`
              mx-auto mb-4 size-12 animate-spin rounded-full border-b-2
              border-green-400
            `}
          ></div>
          <p className="text-gray-400">Loading group details...</p>
        </div>
      </div>
    )
  }

  if (status !== "authenticated") {
    return (
      <div
        className={`
          flex min-h-screen items-center justify-center bg-gradient-to-br
          from-gray-900 via-gray-800 to-black
        `}
      >
        <div className="text-center">
          <p className="text-gray-400">Please log in to view group details.</p>
        </div>
      </div>
    )
  }

  if (error && !group) {
    return (
      <div
        className={`
          flex min-h-screen items-center justify-center bg-gradient-to-br
          from-gray-900 via-gray-800 to-black
        `}
      >
        <div className="max-w-lg text-center">
          <FaExclamationTriangle className="mx-auto mb-4 text-6xl text-red-500" />
          <h2 className="mb-4 text-2xl font-bold text-red-400">
            Failed to load group details
          </h2>
          <p className="mb-6 text-red-300">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={loadGroupData}
              className={`
                rounded-lg bg-green-600 px-6 py-3 text-white transition
                hover:bg-green-500
              `}
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/community/groups")}
              className={`
                flex items-center rounded-lg bg-gray-600 px-6 py-3 text-white
                transition
                hover:bg-gray-500
              `}
            >
              <FaArrowLeft className="mr-2" />
              Back to Groups
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black
        text-white
      `}
    >
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/community/groups")}
            className={`
              mb-4 inline-flex items-center text-green-400
              hover:text-green-300
            `}
          >
            <FaArrowLeft className="mr-2" />
            Back to Groups
          </button>

          {group && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-white">
                    {group.name}
                  </h1>
                  <p className="mb-4 text-gray-300">{group.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <FaUsers className="mr-1" />
                      {members.length} member{members.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center">
                      {group.privacy === "private" ? (
                        <FaLock className="mr-1" />
                      ) : (
                        <FaGlobe className="mr-1" />
                      )}
                      {group.privacy}
                    </span>
                    <span className="flex items-center">
                      <FaCrown className="mr-1" />
                      {group.createdBy?.username || "Unknown"}
                    </span>
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(group.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                mb-6 flex items-center justify-between rounded-lg bg-green-600
                p-4 text-white
              `}
            >
              <div className="flex items-center">
                <FaCheck className="mr-2" />
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className={`
                  text-green-200
                  hover:text-white
                `}
              >
                <FaTimes />
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`
                mb-6 flex items-center justify-between rounded-lg bg-red-600 p-4
                text-white
              `}
            >
              {error}
              <button
                onClick={() => setError(null)}
                className={`
                  text-red-200
                  hover:text-white
                `}
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`
            grid grid-cols-1 gap-6
            lg:grid-cols-4
          `}
        >
          {/* Messages Section */}
          <div className="lg:col-span-3">
            <div
              className={`
                flex h-96 flex-col rounded-lg border border-gray-700 bg-gray-800
              `}
            >
              {/* Messages Header */}
              <div className="border-b border-gray-700 p-4">
                <h2
                  className={`
                    flex items-center text-xl font-semibold text-green-400
                  `}
                >
                  <FaComments className="mr-2" />
                  Messages ({messages.length})
                </h2>
              </div>

              {/* Messages List */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-gray-700 p-3"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className={`
                            flex size-6 items-center justify-center rounded-full
                            bg-green-500 text-xs font-bold
                          `}
                        >
                          {message.sender?.username?.charAt(0)?.toUpperCase() ||
                            "?"}
                        </div>
                        <span className="font-medium text-white">
                          {message.sender?.username || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-200">{message.content}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-center text-gray-500">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="border-t border-gray-700 p-4"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className={`
                      flex-1 rounded-lg bg-gray-700 px-4 py-2 text-white
                      focus:ring-2 focus:ring-green-400 focus:outline-none
                    `}
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className={`
                      flex items-center rounded-lg bg-green-600 px-4 py-2
                      text-white transition
                      hover:bg-green-500
                      disabled:cursor-not-allowed disabled:bg-gray-600
                    `}
                  >
                    <FaPaperPlane
                      className={sendingMessage ? "animate-pulse" : ""}
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Members Section */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <h2
                className={`
                  mb-4 flex items-center text-xl font-semibold text-green-400
                `}
              >
                <FaUsers className="mr-2" />
                Members ({members.length})
              </h2>

              <div className="max-h-80 space-y-3 overflow-y-auto">
                {members.length > 0 ? (
                  members.map((member) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        flex items-center gap-3 rounded bg-gray-700 p-2
                      `}
                    >
                      <div
                        className={`
                          flex size-8 items-center justify-center rounded-full
                          bg-green-500 text-sm font-bold text-white
                        `}
                      >
                        {member.username?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {member.username || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {member.role || "Member"}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="py-4 text-center text-gray-500">
                    No members found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
