// src/app/community/groups/page.client.tsx - CLEAN VERSION
"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaComments,
  FaCrown,
  FaPlus,
  FaSearch,
  FaTimes,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa"

interface Group {
  id: string
  name: string
  description: string
  category: string
  memberCount: number
  isPublic: boolean
  isJoined: boolean
  lastActivity: string
  avatar?: string
  tags: string[]
  createdBy: string
  createdAt: string
}

type CategoryType =
  | "all"
  | "fitness"
  | "study"
  | "career"
  | "lifestyle"
  | "creative"
  | "tech"

const GroupsClient: React.FC = () => {
  const { data: session, status } = useSession()
  const userId = session?.user?.id as string

  const [groups, setGroups] = useState<Group[]>([])
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [joinRequests, setJoinRequests] = useState<Set<string>>(new Set())

  // Load groups and my groups
  useEffect(() => {
    if (status !== "authenticated" || !userId) {
      setLoading(false)
      return
    }

    const fetchAllData = async (): Promise<void> => {
      setLoading(true)
      try {
        console.log("🚀 [CLIENT] Fetching all groups and my groups...")

        // Fetch all groups
        const [groupsResponse, myGroupsResponse] = await Promise.all([
          fetch("/api/groups", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("/api/groups/my-groups", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ])

        console.log(
          "📥 [CLIENT] Groups API response status:",
          groupsResponse.status,
        )
        console.log(
          "📥 [CLIENT] My Groups API response status:",
          myGroupsResponse.status,
        )

        // Handle all groups response
        let allGroupsData: Group[] = []
        if (groupsResponse.ok) {
          const groupsResult = await groupsResponse.json()
          console.log("✅ [CLIENT] All groups API result:", groupsResult)
          allGroupsData = groupsResult.data || groupsResult || []
        } else {
          console.warn(
            "⚠️ [CLIENT] Failed to fetch all groups:",
            groupsResponse.status,
          )
        }

        // Handle my groups response
        let myGroupsData: Group[] = []
        if (myGroupsResponse.ok) {
          const myGroupsResult = await myGroupsResponse.json()
          console.log("✅ [CLIENT] My groups API result:", myGroupsResult)
          myGroupsData = myGroupsResult.data || myGroupsResult || []
        } else {
          console.warn(
            "⚠️ [CLIENT] Failed to fetch my groups:",
            myGroupsResponse.status,
          )
        }

        // Mark which groups are joined
        const myGroupIds = new Set(myGroupsData.map((g) => g.id))
        const enrichedGroups = allGroupsData.map((group) => ({
          ...group,
          isJoined: myGroupIds.has(group.id),
        }))

        setGroups(enrichedGroups)
        setMyGroups(myGroupsData)

        console.log(
          "📊 [CLIENT] Set groups state with",
          enrichedGroups.length,
          "total groups",
        )
        console.log(
          "📊 [CLIENT] Set my groups state with",
          myGroupsData.length,
          "joined groups",
        )
      } catch (err) {
        console.error("💥 [CLIENT] Failed to fetch groups:", err)
        setError("Failed to load groups. Please try again.")
        setGroups([])
        setMyGroups([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [status, userId])

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
    return undefined // Explicitly return undefined when no cleanup needed
  }, [successMessage])

  const handleJoinGroup = async (groupId: string) => {
    if (joinRequests.has(groupId)) return

    const group = groups.find((g) => g.id === groupId)
    setJoinRequests((prev) => new Set(prev).add(groupId))

    try {
      console.log("🚀 [CLIENT] Joining group:", groupId)

      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📥 [CLIENT] Join response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message || `Failed to join group: ${response.status}`,
        )
      }

      // Update both groups and myGroups state
      const updatedGroup = {
        ...group!,
        isJoined: true,
        memberCount: group!.memberCount + 1,
      }

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? updatedGroup : g)),
      )

      setMyGroups((prev) => [...prev, updatedGroup])

      setSuccessMessage(`Successfully joined ${group?.name}! 🎉`)
      console.log("✅ [CLIENT] Successfully joined group")
    } catch (err: any) {
      console.error("💥 [CLIENT] Failed to join group:", err)
      setError(err.message || "Failed to join group. Please try again.")
    } finally {
      setJoinRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(groupId)
        return newSet
      })
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId)

    try {
      console.log("🚀 [CLIENT] Leaving group:", groupId)

      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📥 [CLIENT] Leave response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.message || `Failed to leave group: ${response.status}`,
        )
      }

      // Update both groups and myGroups state
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                isJoined: false,
                memberCount: Math.max(g.memberCount - 1, 0),
              }
            : g,
        ),
      )

      setMyGroups((prev) => prev.filter((g) => g.id !== groupId))

      setSuccessMessage(`Left ${group?.name} successfully.`)
      console.log("✅ [CLIENT] Successfully left group")
    } catch (err: any) {
      console.error("💥 [CLIENT] Failed to leave group:", err)
      setError(err.message || "Failed to leave group. Please try again.")
    }
  }

  // Map backend categories to frontend filter categories
  const mapCategoryForFilter = (backendCategory: string): CategoryType => {
    const categoryMap: { [key: string]: CategoryType } = {
      "Fitness & Health": "fitness",
      "Learning & Education": "study",
      "Career & Business": "career",
      "Lifestyle & Hobbies": "lifestyle",
      "Creative & Arts": "creative",
      Technology: "tech",
    }
    return categoryMap[backendCategory] || "all"
  }

  const categories = [
    { id: "all", label: "All Groups", icon: "🌟", count: groups.length },
    {
      id: "fitness",
      label: "Fitness",
      icon: "💪",
      count: groups.filter(
        (g) => mapCategoryForFilter(g.category) === "fitness",
      ).length,
    },
    {
      id: "study",
      label: "Learning",
      icon: "📚",
      count: groups.filter((g) => mapCategoryForFilter(g.category) === "study")
        .length,
    },
    {
      id: "career",
      label: "Career",
      icon: "💼",
      count: groups.filter((g) => mapCategoryForFilter(g.category) === "career")
        .length,
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      icon: "🌱",
      count: groups.filter(
        (g) => mapCategoryForFilter(g.category) === "lifestyle",
      ).length,
    },
    {
      id: "creative",
      label: "Creative",
      icon: "🎨",
      count: groups.filter(
        (g) => mapCategoryForFilter(g.category) === "creative",
      ).length,
    },
    {
      id: "tech",
      label: "Technology",
      icon: "💻",
      count: groups.filter((g) => mapCategoryForFilter(g.category) === "tech")
        .length,
    },
  ]

  // Apply filters
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const groupFilterCategory = mapCategoryForFilter(group.category)
    const matchesCategory =
      selectedCategory === "all" || groupFilterCategory === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-green-400"></div>
          <p className="text-gray-400">Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/friends"
            className="mb-4 inline-flex items-center text-green-400 hover:text-green-300"
          >
            <FaArrowLeft className="mr-2" />
            Back to Friends
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 flex items-center text-4xl font-bold text-white">
                <FaUsers className="mr-3 text-green-400" />
                Groups
              </h1>
              <p className="text-xl text-gray-300">
                Join communities and connect with like-minded people
              </p>
            </div>

            <Link
              href="/community/groups/create"
              className="flex items-center rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-500"
            >
              <FaPlus className="mr-2" />
              Create Group
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 flex items-center justify-between rounded-lg bg-green-600 p-4 text-white"
            >
              <div className="flex items-center">
                <FaCheck className="mr-2" />
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-200 hover:text-white"
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
              className="mb-6 flex items-center justify-between rounded-lg bg-red-600 p-4 text-white"
            >
              {error}
              <button
                onClick={() => setError(null)}
                className="text-red-200 hover:text-white"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My Groups Section */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-green-400">
              My Groups ({myGroups.length})
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myGroups.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg border border-green-600 bg-green-900 bg-opacity-30 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{group.name}</h3>
                    <FaUserCheck className="text-green-400" />
                  </div>
                  <p className="mb-2 text-sm text-gray-300">
                    {group.memberCount} members
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/community/groups/${group.id}`}
                      className="flex-1 rounded bg-green-600 px-3 py-2 text-center text-sm text-white transition hover:bg-green-500"
                    >
                      <FaComments className="mr-1 inline" />
                      Chat
                    </Link>
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="rounded bg-gray-600 px-3 py-2 text-sm text-white transition hover:bg-gray-500"
                    >
                      Leave
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups, interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 py-4 pl-12 pr-4 text-white placeholder:text-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-7">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id as CategoryType)}
              className={`rounded-lg border p-4 transition-all ${
                selectedCategory === category.id
                  ? "border-green-400 bg-green-600 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-green-400"
              }`}
            >
              <div className="mb-2 text-2xl">{category.icon}</div>
              <h3 className="mb-1 text-sm font-semibold">{category.label}</h3>
              <p className="text-xs opacity-80">{category.count} groups</p>
            </motion.button>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-semibold text-green-400">
            {selectedCategory === "all"
              ? "All Groups"
              : `${categories.find((c) => c.id === selectedCategory)?.label} Groups`}{" "}
            ({filteredGroups.length})
          </h2>

          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center">
              <FaUsers className="mx-auto mb-4 text-6xl text-gray-600" />
              <p className="mb-2 text-xl text-gray-400">
                {groups.length === 0
                  ? "No groups available"
                  : "No groups match your search"}
              </p>
              <p className="text-gray-500">
                {groups.length === 0
                  ? "Be the first to create a group!"
                  : "Try a different search term or category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-6 transition-all duration-200 hover:border-green-400"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-white">
                        {group.name}
                      </h3>
                      <p className="mb-2 text-sm text-gray-400">
                        <FaUsers className="mr-1 inline" />
                        {group.memberCount} members
                      </p>
                    </div>
                    {group.isJoined && (
                      <FaUserCheck className="mt-1 text-green-400" />
                    )}
                  </div>

                  <p className="mb-4 line-clamp-3 text-sm text-gray-300">
                    {group.description}
                  </p>

                  {/* Tags */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-600 px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Activity */}
                  <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      <FaCalendarAlt className="mr-1 inline" />
                      Last active {group.lastActivity}
                    </span>
                    <span>
                      <FaCrown className="mr-1 inline" />
                      {group.createdBy || "Unknown"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {group.isJoined ? (
                      <>
                        <Link
                          href={`/community/groups/${group.id}`}
                          className="flex-1 rounded bg-green-600 px-4 py-2 text-center text-white transition hover:bg-green-500"
                        >
                          <FaComments className="mr-1 inline" />
                          Open Chat
                        </Link>
                        <button
                          onClick={() => handleLeaveGroup(group.id)}
                          className="rounded bg-gray-600 px-4 py-2 text-white transition hover:bg-gray-500"
                        >
                          Leave
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={joinRequests.has(group.id)}
                        className={`w-full rounded px-4 py-2 transition ${
                          joinRequests.has(group.id)
                            ? "cursor-not-allowed bg-gray-600"
                            : "bg-green-600 hover:bg-green-500"
                        } text-white`}
                      >
                        {joinRequests.has(group.id)
                          ? "Joining..."
                          : "Join Group"}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupsClient
