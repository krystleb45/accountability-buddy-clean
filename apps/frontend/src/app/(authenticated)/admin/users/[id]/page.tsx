import { getServerSession } from "next-auth"
import Link from "next/link"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface User {
  _id: string
  username: string
  email: string
  name: string
  role: string
  isVerified: boolean
  subscription_status: string
  subscriptionTier: string
  trial_end_date: string
  createdAt: string
  stripeCustomerId?: string
}

interface Activity {
  _id: string
  type: string
  description: string
  createdAt: string
}

interface Goal {
  _id: string
  title: string
  status: string
  createdAt: string
}

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.accessToken) {
    redirect("/login")
  }

  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL

  let user: User | null = null
  let activities: Activity[] = []
  let goals: Goal[] = []

  try {
    // Fetch user details
    const userRes = await fetch(`${backendUrl}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
      cache: "no-store",
    })
    if (userRes.ok) {
      const data = await userRes.json()
      user = data.data?.user || null
    }

    // Fetch user activities
    const actRes = await fetch(`${backendUrl}/api/admin/users/${id}/activities`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
      cache: "no-store",
    })
    if (actRes.ok) {
      const data = await actRes.json()
      activities = data.data?.activities || []
    }

    // Fetch user goals
    const goalsRes = await fetch(`${backendUrl}/api/admin/users/${id}/goals`, {
      headers: { Authorization: `Bearer ${session.user.accessToken}` },
      cache: "no-store",
    })
    if (goalsRes.ok) {
      const data = await goalsRes.json()
      goals = data.data?.goals || []
    }
  } catch (error) {
    console.error("Failed to fetch user details:", error)
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-400">User not found</p>
        <Link href="/admin/users" className="text-green-400 hover:underline">
          ← Back to Users
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link href="/admin/users" className="mb-4 inline-block text-green-400 hover:underline">
        ← Back to Users
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-white">User Details</h1>

      {/* User Info Card */}
      <div className="mb-6 rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Username:</span>
            <p className="text-white">{user.username}</p>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <p className="text-white">{user.email}</p>
          </div>
          <div>
            <span className="text-gray-400">Name:</span>
            <p className="text-white">{user.name || "Not set"}</p>
          </div>
          <div>
            <span className="text-gray-400">Role:</span>
            <p className="text-white">{user.role}</p>
          </div>
          <div>
            <span className="text-gray-400">Verified:</span>
            <p className={user.isVerified ? "text-green-400" : "text-red-400"}>
              {user.isVerified ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Joined:</span>
            <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="mb-6 rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Subscription</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Status:</span>
            <p className={`font-medium ${
              user.subscription_status === "active" ? "text-green-400" :
              user.subscription_status === "trial" ? "text-yellow-400" : "text-red-400"
            }`}>
              {user.subscription_status}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Tier:</span>
            <p className="text-white">{user.subscriptionTier}</p>
          </div>
          <div>
            <span className="text-gray-400">Trial Ends:</span>
            <p className="text-white">
              {user.trial_end_date ? new Date(user.trial_end_date).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Stripe ID:</span>
            <p className="text-white text-xs">{user.stripeCustomerId || "None"}</p>
          </div>
        </div>
      </div>

      {/* Goals Card */}
      <div className="mb-6 rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Goals ({goals.length})</h2>
        {goals.length === 0 ? (
          <p className="text-gray-400">No goals created</p>
        ) : (
          <div className="space-y-2">
            {goals.slice(0, 10).map((goal) => (
              <div key={goal._id} className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-white">{goal.title}</span>
                <span className={`text-xs ${
                  goal.status === "completed" ? "text-green-400" : "text-gray-400"
                }`}>
                  {goal.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Card */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Activity</h2>
        {activities.length === 0 ? (
          <p className="text-gray-400">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 20).map((activity) => (
              <div key={activity._id} className="flex justify-between border-b border-gray-700 pb-2">
                <div>
                  <span className="rounded bg-green-600 px-2 py-1 text-xs text-white">
                    {activity.type}
                  </span>
                  <span className="ml-2 text-white">{activity.description}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}