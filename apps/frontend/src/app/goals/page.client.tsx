// src/app/goals/page.client.tsx - With limit notifications
"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import type { Goal } from "@/services/goalService"

import { showLimitReachedToast } from "@/components/Toasts"
import useSubscription from "@/hooks/useSubscription"
import GoalService from "@/services/goalService"

function formatDueDate(due: unknown): string {
  if (!due) return "No due date"
  try {
    let date: Date
    if (due instanceof Date) {
      date = due
    } else if (typeof due === "string") {
      date = new Date(due)
    } else {
      return "No due date"
    }
    if (Number.isNaN(date.getTime())) return "No due date"
    return date.toLocaleDateString()
  } catch {
    return "No due date"
  }
}

function daysLeft(due: unknown): string {
  if (!due) return ""
  try {
    let date: Date
    if (due instanceof Date) {
      date = due
    } else if (typeof due === "string") {
      date = new Date(due)
    } else {
      return ""
    }
    if (Number.isNaN(date.getTime())) return ""
    const diffMs = date.getTime() - Date.now()
    const d = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (d > 1) return `${d} days left`
    if (d === 1) return "1 day left"
    if (d === 0) return "Due today"
    return "Past due"
  } catch {
    return ""
  }
}

export default function GoalsClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Get subscription limits
  const {
    status: subscriptionStatus,
    hasUnlimitedGoals,
    maxGoals,
    loading: subscriptionLoading,
  } = useSubscription()

  // Debug session and token
  useEffect(() => {
    console.log("🔍 Session Debug Info:")
    console.log("Session status:", status)
    console.log("Session data:", session)
    console.log("User:", session?.user)
    console.log("Access token:", session?.user?.accessToken)
    return undefined
  }, [session, status])

  async function loadGoals() {
    console.log("🔄 Starting to load goals...")
    console.log("Session status:", status)
    console.log("Has session:", !!session)
    console.log("Has access token:", !!session?.user?.accessToken)

    if (status !== "authenticated" || !session?.user?.accessToken) {
      console.log("❌ Not authenticated or no access token")
      setError("Authentication required")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      console.log(
        "📡 Making API call with token:",
        `${session.user.accessToken.substring(0, 20)}...`,
      )
      const list = await GoalService.getUserGoals()
      console.log("✅ Goals loaded successfully:", list)
      setGoals(list ?? [])
      setError(null)
    } catch (e) {
      console.error("❌ Failed to load goals:", e)
      setError("Failed to load goals. Please try refreshing the page.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "loading") {
      console.log("⏳ Session still loading...")
      return undefined
    }

    if (status === "unauthenticated") {
      console.log("❌ User not authenticated")
      setError("Please log in to view your goals")
      setLoading(false)
      return undefined
    }

    if (status === "authenticated") {
      console.log("✅ User authenticated, loading goals")
      loadGoals()
    }
    return undefined
  }, [status, session])

  // Keep for future use - will be needed when implementing goal deletion
  const handleDelete = async () => {
    if (!selectedId) return

    setLoading(true)
    try {
      await GoalService.deleteGoal(selectedId)
      setGoals((curr) => curr.filter((g) => g.id !== selectedId))
      setSelectedId(null)
    } catch {
      setError("Could not delete goal.")
    } finally {
      setLoading(false)
    }
  }

  // Keep for future use - will be needed when implementing goal updates
  const handleUpdate = (updated: Goal) => {
    console.log("🔄 Updating goal in parent:", updated)
    setGoals((curr) => {
      const newGoals = curr.map((g) => {
        if (g.id === updated.id) {
          console.log("✅ Found matching goal, replacing:", g, "with:", updated)
          return updated
        }
        return g
      })
      console.log("🗒️ Updated goals list:", newGoals)
      return newGoals
    })
  }

  // Calculate active goals count from current goals
  const activeGoalsCount = goals.filter(
    (goal) => goal.status === "active" || !goal.status,
  ).length

  // Determine if user can create more goals
  const canUserCreateGoal = () => {
    if (subscriptionLoading) return false
    if (hasUnlimitedGoals) return true
    return activeGoalsCount < maxGoals
  }

  // Keep for future use - will be needed when implementing goal creation button
  const handleAddGoalClick = () => {
    if (!canUserCreateGoal()) {
      // Show toast notification instead of just disabling button
      showLimitReachedToast(
        "Goal",
        subscriptionStatus?.currentPlan || "current",
      )
      return
    }

    // Proceed to goal creation
    router.push("/goal-creation")
  }

  // Get upgrade message based on subscription tier
  const getUpgradeMessage = () => {
    if (hasUnlimitedGoals) return null
    if (!subscriptionStatus?.currentPlan) return "Upgrade to create more goals"

    const remaining = maxGoals - activeGoalsCount
    if (remaining <= 0) {
      return subscriptionStatus.currentPlan === "basic"
        ? "Upgrade to Pro for unlimited goals"
        : "Goal limit reached - upgrade for more"
    }
    return `${remaining} of ${maxGoals} goals remaining`
  }

  // Temporary: prevent unused variable warnings (remove when functions are used)
  void handleDelete
  void handleUpdate
  void handleAddGoalClick

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="p-6 text-center">
        <p>Loading session...</p>
      </div>
    )
  }

  // Show authentication error
  if (status === "unauthenticated") {
    return (
      <div className="p-6 text-center">
        <p className="mb-4 text-red-500">Please log in to view your goals</p>
        <Link
          href="/login"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Go to Login
        </Link>
      </div>
    )
  }

  if (loading) return <p className="p-6 text-center">Loading goals…</p>

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Refresh Page
        </button>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      {/* Debug Info */}
      <div className="mb-4 rounded bg-gray-800 p-4 text-sm">
        <p>🔍 Debug Info:</p>
        <p>Session Status: {status}</p>
        <p>User Email: {session?.user?.email}</p>
        <p>Has Token: {session?.user?.accessToken ? "Yes" : "No"}</p>
        <p>Goals Count: {goals.length}</p>
      </div>

      {/* Rest of your existing JSX... */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex flex-col items-end gap-2">
          {!subscriptionLoading && (
            <div className="text-sm text-gray-400">{getUpgradeMessage()}</div>
          )}

          {canUserCreateGoal() ? (
            <Link
              href="/goal-creation"
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              + Add Goal
            </Link>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <button
                disabled
                className="cursor-not-allowed rounded bg-gray-600 px-4 py-2 text-gray-400"
                title={
                  hasUnlimitedGoals
                    ? "Loading..."
                    : `Goal limit reached (${activeGoalsCount}/${maxGoals})`
                }
              >
                + Add Goal
              </button>
              {!hasUnlimitedGoals && (
                <Link
                  href="/subscription"
                  className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-6 text-3xl font-bold text-kelly-green">
        🎯 Your Goals
      </h2>

      {/* Goals display... */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {goals.map((g) => {
          const dateValue = g.dueDate
          return (
            <div
              key={g.id}
              className="cursor-pointer rounded-lg bg-gray-900 p-4 shadow-lg transition-transform hover:scale-105"
              onClick={() => setSelectedId(g.id)}
            >
              <span className="mb-2 inline-block rounded bg-green-700 px-2 py-1 text-xs text-white">
                {(g as any).category ?? "General"}
              </span>
              <h3 className="mb-1 text-lg font-semibold text-kelly-green">
                {g.title}
              </h3>
              <div className="mb-3 flex items-center justify-between text-sm text-gray-400">
                <span>Due: {formatDueDate(dateValue)}</span>
                <span>{daysLeft(dateValue)}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                  className="duration-800 h-full bg-green-500 transition-all"
                  style={{ width: `${g.progress || 0}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && !loading && (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">🎯</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-300">
            No goals yet
          </h3>
          <p className="mb-6 text-gray-400">
            Create your first goal to get started!
          </p>
          {canUserCreateGoal() && (
            <Link
              href="/goal-creation"
              className="inline-block rounded-lg bg-green-500 px-6 py-3 text-white hover:bg-green-600"
            >
              Create Your First Goal
            </Link>
          )}
        </div>
      )}

      {/* Simple goal details modal */}
      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-lg bg-gray-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-2 top-2 text-gray-400 hover:text-white"
              onClick={() => setSelectedId(null)}
            >
              ✕
            </button>
            <div className="text-center">
              <h3 className="mb-4 text-xl font-bold text-white">
                Goal Details
              </h3>
              <p className="text-gray-400">Selected goal ID: {selectedId}</p>
              <p className="mt-2 text-sm text-gray-500">
                (Debug mode - full details component removed for testing)
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
