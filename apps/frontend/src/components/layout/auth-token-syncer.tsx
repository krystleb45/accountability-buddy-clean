"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

import { STORAGE_KEYS } from "@/constants/storageKeys"

export function AuthTokenSyncer(): null {
  const { data: session } = useSession()

  useEffect(() => {
    const token = session?.user?.accessToken
    if (token) {
      // Store under the same key your http interceptor reads
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }
  }, [session])

  return null
}
