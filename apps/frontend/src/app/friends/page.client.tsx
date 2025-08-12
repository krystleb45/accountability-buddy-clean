// src/app/friends/page.client.tsx
"use client"

import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import React, { useCallback, useEffect, useState } from "react"
import {
  FaArrowLeft,
  FaBell,
  FaCheck,
  FaComments,
  FaTimes,
  FaUserFriends,
} from "react-icons/fa"

import type { FollowUser } from "@/api/friends/friendApi"

import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriendRequests,
  fetchFriends,
} from "@/api/friends/friendApi"

const FriendsClient: React.FC = () => {
  const { data: session, status } = useSession()
  const userId = session?.user?.id as string

  const [friends, setFriends] = useState<FollowUser[]>([])
  const [friendRequests, setFriendRequests] = useState<
    { id: string; sender: FollowUser }[]
  >([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load friends & requests once we have a userId
  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      setLoading(false)
      return
    }

    const fetchData = async (): Promise<void> => {
      setLoading(true)
      try {
        const [friendsData, requestsData] = await Promise.all([
          fetchFriends(userId),
          fetchFriendRequests(userId),
        ])
        console.log("🔍 Friends API Response:", friendsData)
        console.log("🔍 Requests API Response:", requestsData)

        // Ensure we always set arrays
        const friendsArray = Array.isArray(friendsData) ? friendsData : []
        const requestsArray = Array.isArray(requestsData) ? requestsData : []

        setFriends(friendsArray)
        setFriendRequests(requestsArray)
        setError(null) // Clear any previous errors
      } catch (err) {
        console.error("Failed to fetch friends or requests:", err)
        setError("Failed to load friends data. Please try refreshing the page.")
        // Set empty arrays as fallback
        setFriends([])
        setFriendRequests([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, userId])

  const handleAcceptRequest = useCallback(
    async (requestId: string) => {
      if (!userId) return
      try {
        await acceptFriendRequest(userId, requestId)
        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId))
        const updated = await fetchFriends(userId)
        setFriends(updated || [])
      } catch (err) {
        console.error("Error accepting friend request:", err)
        setError("Failed to accept request.")
      }
    },
    [userId],
  )

  const handleRejectRequest = useCallback(
    async (requestId: string) => {
      if (!userId) return
      try {
        await declineFriendRequest(userId, requestId)
        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId))
      } catch (err) {
        console.error("Error declining friend request:", err)
        setError("Failed to decline request.")
      }
    },
    [userId],
  )

  const safeFriends = Array.isArray(friends) ? friends : []
  const filteredFriends = safeFriends.filter((f) =>
    f?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-green-400"></div>
          <p className="text-gray-400">Loading friends...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <Link
            href="/community"
            className="text-green-400 hover:text-green-300"
          >
            ← Back to Community
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/community"
            className="mb-4 inline-flex items-center text-green-400 hover:text-green-300"
          >
            <FaArrowLeft className="mr-2" />
            Back to Community
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="flex items-center text-4xl font-bold text-white">
              <FaUserFriends className="mr-3 text-green-400" />
              Friends
            </h1>
            {friendRequests.length > 0 && (
              <div className="relative">
                <FaBell className="text-3xl text-yellow-400" />
                <span className="absolute -right-2 -top-2 min-w-[20px] rounded-full bg-red-500 px-2 py-1 text-center text-xs font-bold text-white">
                  {friendRequests.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg"
          >
            <h2 className="mb-4 flex items-center text-2xl font-semibold text-green-400">
              <FaBell className="mr-2" />
              Pending Friend Requests
            </h2>
            <div className="space-y-4">
              {friendRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg bg-gray-700 p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={req.sender.profilePicture || "/default-avatar.png"}
                      alt="Avatar"
                      className="size-12 rounded-full border-2 border-gray-600 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {req.sender.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        Wants to be your accountability buddy
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-500"
                      onClick={() => handleAcceptRequest(req.id)}
                    >
                      <FaCheck className="mr-1" />
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-500"
                      onClick={() => handleRejectRequest(req.id)}
                    >
                      <FaTimes className="mr-1" />
                      Decline
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Friends List Section */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
          <h2 className="mb-6 flex items-center text-2xl font-semibold text-green-400">
            <FaUserFriends className="mr-2" />
            Your Accountability Buddies ({safeFriends.length})
          </h2>

          {/* Search */}
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-6 w-full rounded-lg border border-gray-600 bg-gray-700 p-4 text-white placeholder:text-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* Friends Grid */}
          {filteredFriends.length === 0 ? (
            <div className="py-12 text-center">
              <FaUserFriends className="mx-auto mb-4 text-6xl text-gray-600" />
              <p className="mb-2 text-xl text-gray-400">
                {safeFriends.length === 0
                  ? "No friends yet"
                  : "No friends match your search"}
              </p>
              <p className="text-gray-500">
                {safeFriends.length === 0
                  ? "Start connecting with accountability partners to stay motivated!"
                  : "Try a different search term"}
              </p>
              {safeFriends.length === 0 && (
                <Link
                  href="/community/discover"
                  className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-500"
                >
                  Find Friends
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFriends.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-gray-600 bg-gray-700 p-4 transition-all duration-200 hover:border-green-400"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <img
                      src={friend.profilePicture || "/default-avatar.png"}
                      alt="Profile"
                      className="size-12 rounded-full border-2 border-gray-600 object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{friend.name}</p>
                      <p className="text-sm text-gray-400">
                        Accountability Buddy
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/messages?friendId=${friend.id}`}
                      className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-500"
                    >
                      <FaComments className="mr-2" />
                      Chat
                    </Link>
                    <Link
                      href={`/friends/${friend.id}`}
                      className="flex flex-1 items-center justify-center rounded-lg bg-gray-600 px-3 py-2 text-white transition hover:bg-gray-500"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/community/discover"
            className="rounded-lg bg-green-600 p-4 text-center transition hover:bg-green-500"
          >
            <div className="mb-2 text-2xl">🔍</div>
            <div className="font-semibold">Find Friends</div>
            <div className="text-sm opacity-90">
              Discover new accountability partners
            </div>
          </Link>

          <Link
            href="/community/groups"
            className="rounded-lg bg-purple-600 p-4 text-center transition hover:bg-purple-500"
          >
            <div className="mb-2 text-2xl">👥</div>
            <div className="font-semibold">Join Groups</div>
            <div className="text-sm opacity-90">
              Connect with like-minded people
            </div>
          </Link>

          <Link
            href="/messages"
            className="rounded-lg bg-blue-600 p-4 text-center transition hover:bg-blue-500"
          >
            <div className="mb-2 text-2xl">💬</div>
            <div className="font-semibold">Messages</div>
            <div className="text-sm opacity-90">Chat with your network</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FriendsClient
