"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

import type { ProfileData } from "@/api/profile/profileApi"

import Profile from "@/components/Profile/Profile"

interface ProfileClientProps {
  initialProfile: ProfileData
}

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // 1) If unauthenticated, bounce to /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  // 2) While NextAuth is loading, show a full-screen loader
  if (status === "loading") {
    return (
      <div
        className={`
          flex min-h-screen items-center justify-center bg-black text-white
        `}
      >
        <p>Loading profile…</p>
      </div>
    )
  }

  // 3) session should now exist—otherwise we’ve redirected
  if (!session) return null

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      {/* Back link */}
      <nav className="mb-6">
        <Link
          href="/dashboard"
          className={`
            text-primary
            hover:underline
          `}
        >
          ← Back to Dashboard
        </Link>
      </nav>

      {/* Your Profile card */}
      <div
        className={`
          mx-auto max-w-4xl overflow-hidden rounded-lg bg-gray-900 shadow-lg
        `}
      >
        <Profile initialProfile={initialProfile} />
      </div>
    </div>
  )
}
