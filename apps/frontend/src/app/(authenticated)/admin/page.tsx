import { BookOpen, FileText, MessageSquare, Shield, Users } from "lucide-react"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface AdminStats {
  users: {
    total: number
    trial: number
    active: number
    expired: number
    newThisWeek: number
    newThisMonth: number
  }
  feedback: {
    total: number
    thisWeek: number
  }
}

interface RecentUser {
  _id: string
  name: string
  email: string
  createdAt: string
  subscription_status: string
}

interface RecentFeedback {
  _id: string
  message: string
  type: string
  createdAt: string
  userId: string
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    redirect("/login")
  }

  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

  let stats: AdminStats | null = null
  let recentUsers: RecentUser[] = []
  let recentFeedback: RecentFeedback[] = []

  try {
    const response = await fetch(`${backendUrl}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: "no-store",
    })

    if (response.ok) {
      const data = await response.json()
      stats = data.data?.stats || null
      recentUsers = data.data?.recentUsers || []
      recentFeedback = data.data?.recentFeedback || []
    }
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
  }

  return (
    <div className="p-6">
      <h1 className="mb-8 text-2xl font-bold text-white">Admin Dashboard</h1>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            href="/admin/users"
            className="flex flex-col items-center gap-2 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <Users className="h-8 w-8 text-blue-400" />
            <span className="text-white">Users</span>
          </Link>
          <Link
            href="/admin/feedback"
            className="flex flex-col items-center gap-2 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <MessageSquare className="h-8 w-8 text-green-400" />
            <span className="text-white">Feedback</span>
          </Link>
          <Link
            href="/admin/blog"
            className="flex flex-col items-center gap-2 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <FileText className="h-8 w-8 text-purple-400" />
            <span className="text-white">Blog</span>
          </Link>
          <Link
            href="/admin/books"
            className="flex flex-col items-center gap-2 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <BookOpen className="h-8 w-8 text-yellow-400" />
            <span className="text-white">Books</span>
          </Link>
          <Link
            href="/admin/badges"
            className="flex flex-col items-center gap-2 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <Shield className="h-8 w-8 text-orange-400" />
            <span className="text-white">Badges</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-sm text-gray-400">Total Users</p>
          <p className="text-3xl font-bold text-white">{stats?.users.total || 0}</p>
        </div>

        {/* Trial Users */}
        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-sm text-gray-400">Trial Users</p>
          <p className="text-3xl font-bold text-yellow-400">{stats?.users.trial || 0}</p>
        </div>

        {/* Active Subscribers */}
        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-sm text-gray-400">Active Subscribers</p>
          <p className="text-3xl font-bold text-green-400">{stats?.users.active || 0}</p>
        </div>

        {/* Total Feedback */}
        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-sm text-gray-400">Total Feedback</p>
          <p className="text-3xl font-bold text-blue-400">{stats?.feedback.total || 0}</p>
        </div>
      </div>

      {/* Growth Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-sm text-gray-400">New Users This Week</p>
          <p className="text-2xl font-bold text-green-400">+{stats?.users.newThisWeek || 0}</p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-sm text-gray-400">New Users This Month</p>
          <p className="text-2xl font-bold text-green-400">+{stats?.users.newThisMonth || 0}</p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <p className="text-sm text-gray-400">Feedback This Week</p>
          <p className="text-2xl font-bold text-blue-400">{stats?.feedback.thisWeek || 0}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Signups</h2>
          {recentUsers.length === 0 ? (
            <p className="text-gray-400">No recent signups</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between border-b border-gray-700 pb-2"
                >
                  <div>
                    <p className="text-white">{user.name || "No name"}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        user.subscription_status === "active"
                          ? "bg-green-600"
                          : user.subscription_status === "trial"
                            ? "bg-yellow-600"
                            : "bg-gray-600"
                      }`}
                    >
                      {user.subscription_status}
                    </span>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Feedback */}
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Feedback</h2>
          {recentFeedback.length === 0 ? (
            <p className="text-gray-400">No recent feedback</p>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((feedback) => (
                <div
                  key={feedback._id}
                  className="border-b border-gray-700 pb-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-green-600 px-2 py-1 text-xs">
                      {feedback.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-300">
                    {feedback.message.length > 100
                      ? `${feedback.message.substring(0, 100)}...`
                      : feedback.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}