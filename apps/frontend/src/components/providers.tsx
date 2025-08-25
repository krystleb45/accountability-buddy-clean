"use client"

import type { ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"

import { AuthProvider } from "@/context/auth/auth-context"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (error.message.includes("Authentication failed")) {
          return false
        }

        return failureCount < 3
      },
    },
  },
})

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Refetch every hour because access tokens expires in an hour */}
      <SessionProvider refetchInterval={60 * 60}>
        <AuthProvider>{children}</AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
