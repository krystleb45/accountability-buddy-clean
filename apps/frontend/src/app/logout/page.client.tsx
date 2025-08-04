"use client"

import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

export default function LogoutClient() {
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      // dynamically import and cast to any so TS knows we have signOut
      const mod = (await import("next-auth/react")) as any
      const { signOut } = mod

      await signOut({ redirect: false })
      sessionStorage.clear()
      localStorage.clear()
      router.replace("/login")
    })()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-6">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">Logging Out…</h1>
        <p className="text-lg text-gray-600">
          You will be redirected to the login page shortly.
        </p>
      </div>
    </div>
  )
}
