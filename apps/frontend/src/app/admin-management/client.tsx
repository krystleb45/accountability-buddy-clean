"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import type { UserInfo } from "@/services/authService"

import AdminService from "@/services/adminService"
import AuthService from "@/services/authService"
import { PERMISSIONS, userHasPermission } from "@/services/roleService"

export default function ClientAdminManagement(): React.ReactElement {
  const router = useRouter()
  const [userCount, setUserCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true)
      try {
        // 1) get current user
        const currentUser: UserInfo = await AuthService.getMe()
        if (!userHasPermission(currentUser, PERMISSIONS.EDIT_SETTINGS)) {
          router.push("/dashboard")
          return
        }

        // 2) fetch paginated list of users (first page, large limit)
        const resp = await AdminService.listUsers(1, 1000)
        if (resp.success && resp.data) {
          setUserCount(resp.data.users.length)
        } else {
          throw new Error(resp.message || "Failed to load users")
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Admin Management
        </h1>
        <p className="text-lg text-gray-600">
          Manage roles, permissions, and administrative settings with ease.
        </p>
      </header>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading data...</div>
      ) : error ? (
        <div className="text-center text-lg text-red-600">Error: {error}</div>
      ) : (
        <main
          className={`
            mx-auto grid max-w-6xl grid-cols-1 gap-6
            md:grid-cols-2
            lg:grid-cols-3
          `}
        >
          {/* User Roles */}
          <section
            className={`
              rounded-lg bg-white p-6 shadow-lg transition-transform
              hover:scale-105 hover:shadow-xl
            `}
          >
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              User Roles
            </h2>
            <p className="mb-4 text-gray-600">
              Assign roles and manage user permissions across the platform.
            </p>
            <p className="text-lg font-bold text-gray-700">
              Total Users: {userCount ?? "N/A"}
            </p>
            <button
              onClick={() => router.push("/admin-management/roles")}
              className={`
                w-full rounded-lg bg-blue-600 px-4 py-2 text-white
                transition-colors
                hover:bg-blue-700
              `}
            >
              Manage Roles
            </button>
          </section>

          {/* Permissions */}
          <section
            className={`
              rounded-lg bg-white p-6 shadow-lg transition-transform
              hover:scale-105 hover:shadow-xl
            `}
          >
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Permissions
            </h2>
            <p className="mb-4 text-gray-600">
              Define what users can access and modify on the platform.
            </p>
            <button
              onClick={() => router.push("/admin-management/permissions")}
              className={`
                w-full rounded-lg bg-green-600 px-4 py-2 text-white
                transition-colors
                hover:bg-green-700
              `}
            >
              Manage Permissions
            </button>
          </section>

          {/* System Settings */}
          <section
            className={`
              rounded-lg bg-white p-6 shadow-lg transition-transform
              hover:scale-105 hover:shadow-xl
            `}
          >
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              System Settings
            </h2>
            <p className="mb-4 text-gray-600">
              Adjust global configurations for the platform.
            </p>
            <button
              onClick={() => router.push("/admin-management/settings")}
              className={`
                w-full rounded-lg bg-orange-600 px-4 py-2 text-white
                transition-colors
                hover:bg-orange-700
              `}
            >
              Edit Settings
            </button>
          </section>

          {/* Rewards */}
          <section
            className={`
              rounded-lg bg-white p-6 shadow-lg transition-transform
              hover:scale-105 hover:shadow-xl
            `}
          >
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Manage Rewards
            </h2>
            <p className="mb-4 text-gray-600">
              Create, update, and manage available rewards for users to redeem.
            </p>
            <button
              onClick={() => router.push("/admin-management/rewards")}
              className={`
                w-full rounded-lg bg-purple-600 px-4 py-2 text-white
                transition-colors
                hover:bg-purple-700
              `}
            >
              Manage Rewards
            </button>
          </section>
        </main>
      )}

      <footer className="mt-12 text-center text-gray-600">
        &copy; {new Date().getFullYear()} Accountability Buddy. All rights
        reserved.
      </footer>
    </div>
  )
}
