"use client"

import type { PropsWithChildren } from "react"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { createContext, use, useEffect, useMemo } from "react"
import { toast } from "sonner"

import type { User } from "@/types/mongoose.gen"

import { http } from "@/lib/http"

export interface AuthContextType {
  user: User | null
  loading: boolean
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const ctx = use(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be inside AuthProvider")
  }
  return ctx
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { status } = useSession()

  const {
    data: user,
    isPending: loading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await http.get<{ data: { user: User } }>("/auth/me")
      return res.data.data.user
    },
    enabled: status === "authenticated",
  })

  useEffect(() => {
    if (error) {
      toast.error("Error fetching your details", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }, [error])

  const ctxValue = useMemo(
    () => ({
      user: user ?? null,
      loading,
      refetchUser: async () => {
        await refetch()
      },
    }),
    [user, loading, refetch],
  )

  return <AuthContext value={ctxValue}>{children}</AuthContext>
}
