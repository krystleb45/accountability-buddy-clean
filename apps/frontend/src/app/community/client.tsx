// src/app/community/client.tsx

"use client"

import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import type {
  CommunityStats,
  OnlineFriend,
  RecentMessage,
} from "../../api/community/communityApi"

import {
  fetchCommunityStats,
  fetchOnlineFriends,
  fetchRecentMessages,
} from "../../api/community/communityApi"

interface QuickAction {
  title: string
  description: string
  icon: string
  href: string
  count?: number
  color: string
}

export default function CommunityClient() {
  const { status } = useSession()
  const [stats, setStats] = useState<CommunityStats>({
    totalFriends: 0,
    activeGroups: 0,
    unreadMessages: 0,
    onlineFriends: 0,
  })
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load community data
  useEffect(() => {
    async function loadCommunityData() {
      if (status !== "authenticated") {
        setLoading(false)
        return
      }

      try {
        setError(null)
        console.log("🔄 Loading community data...")

        // Load all data in parallel
        const [statsData, messagesData, friendsData] = await Promise.allSettled(
          [
            fetchCommunityStats(),
            fetchRecentMessages(5),
            fetchOnlineFriends(5),
          ],
        )

        // Process stats
        if (statsData.status === "fulfilled") {
          setStats(statsData.value)
        } else {
          console.error("Failed to load stats:", statsData.reason)
        }

        // Process recent messages
        if (messagesData.status === "fulfilled") {
          setRecentMessages(messagesData.value)
        } else {
          console.error("Failed to load recent messages:", messagesData.reason)
        }

        // Process online friends
        if (friendsData.status === "fulfilled") {
          setOnlineFriends(friendsData.value)
        } else {
          console.error("Failed to load online friends:", friendsData.reason)
        }

        console.log("✅ Community data loaded successfully")
      } catch (error) {
        console.error("❌ Failed to load community data:", error)
        setError(
          "Failed to load community data. Please try refreshing the page.",
        )
      } finally {
        setLoading(false)
      }
    }

    loadCommunityData()
  }, [status])

  const quickActions: QuickAction[] = [
    {
      title: "Friends",
      description: "Connect with accountability partners",
      icon: "👥",
      href: "/friends",
      count: stats.totalFriends,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Groups",
      description: "Join goal-focused communities",
      icon: "🎯",
      href: "/community/groups",
      count: stats.activeGroups,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Messages",
      description: "Chat with friends and groups",
      icon: "💬",
      href: "/messages",
      count: stats.unreadMessages,
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Find People",
      description: "Discover new accountability buddies",
      icon: "🔍",
      href: "/community/discover",
      color: "bg-orange-600 hover:bg-orange-700",
    },
  ]

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="mx-auto max-w-6xl p-6">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-1/3 rounded bg-gray-700"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array.from({ length: 4 })].map((_, i) => (
                <div key={i} className="h-48 rounded-lg bg-gray-700"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Authentication Required</h2>
          <p className="mb-6 text-gray-400">
            Please log in to access the community.
          </p>
          <Link
            href="/login"
            className="rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-500"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center text-green-400 hover:text-green-300"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="mb-2 text-4xl font-bold text-white">
            🤝 Community Hub
          </h1>
          <p className="text-xl text-gray-300">
            Connect, collaborate, and stay accountable together
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg bg-red-600 p-4 text-white">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-red-200 underline hover:text-white"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.totalFriends}
            </div>
            <div className="text-sm text-gray-400">Friends</div>
          </div>
          <div className="rounded-lg bg-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.activeGroups}
            </div>
            <div className="text-sm text-gray-400">Active Groups</div>
          </div>
          <div className="rounded-lg bg-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats.unreadMessages}
            </div>
            <div className="text-sm text-gray-400">Unread Messages</div>
          </div>
          <div className="rounded-lg bg-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {stats.onlineFriends}
            </div>
            <div className="text-sm text-gray-400">Online Now</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={action.href}>
                <div
                  className={`${action.color} rounded-lg p-6 text-center shadow-lg transition-all duration-200 hover:shadow-xl`}
                >
                  <div className="mb-3 text-4xl">{action.icon}</div>
                  <h3 className="mb-2 text-xl font-bold">{action.title}</h3>
                  <p className="mb-3 text-sm opacity-90">
                    {action.description}
                  </p>
                  {action.count !== undefined && (
                    <div className="rounded-full bg-white bg-opacity-20 px-3 py-1 text-sm font-medium">
                      {action.count}{" "}
                      {action.count === 1
                        ? action.title.slice(0, -1)
                        : action.title}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg bg-gray-800 p-6"
          >
            <h3 className="mb-4 flex items-center text-xl font-bold">
              💬 Recent Messages
              {stats.unreadMessages > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                  {stats.unreadMessages}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-center space-x-3 rounded-lg bg-gray-700 p-3"
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold">
                      {message.senderAvatar ? (
                        <img
                          src={message.senderAvatar}
                          alt={message.senderName}
                          className="size-8 rounded-full"
                        />
                      ) : (
                        (message.senderName || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {message.isGroup
                          ? message.groupName
                          : message.senderName}
                      </div>
                      <div className="truncate text-xs text-gray-400">
                        {message.content}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <div className="mb-2 text-4xl">💬</div>
                  <p>No recent messages</p>
                  <p className="text-sm">Start chatting with friends!</p>
                </div>
              )}
            </div>
            <Link
              href="/messages"
              className="mt-4 block text-center text-sm text-blue-400 hover:text-blue-300"
            >
              View All Messages →
            </Link>
          </motion.div>

          {/* Online Friends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg bg-gray-800 p-6"
          >
            <h3 className="mb-4 flex items-center text-xl font-bold">
              🟢 Online Friends
            </h3>
            <div className="space-y-3">
              {onlineFriends.length > 0 ? (
                onlineFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center space-x-3 rounded-lg bg-gray-700 p-3"
                  >
                    <div className="relative">
                      <div className="flex size-8 items-center justify-center rounded-full bg-purple-500 text-sm font-bold">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.name || "Friend"}
                            className="size-8 rounded-full"
                          />
                        ) : (
                          (friend.name || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-gray-700 bg-green-400"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {friend.name || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {friend.status || "Online"}
                      </div>
                    </div>
                    <button className="rounded-full bg-blue-600 px-3 py-1 text-xs hover:bg-blue-700">
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <div className="mb-2 text-4xl">👥</div>
                  <p>No friends online</p>
                  <p className="text-sm">Invite friends to join!</p>
                </div>
              )}
            </div>
            <Link
              href="/friends"
              className="mt-4 block text-center text-sm text-blue-400 hover:text-blue-300"
            >
              View All Friends →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
