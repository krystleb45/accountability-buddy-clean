"use client"

import type { ReactNode } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"

import { AuthProvider } from "@/context/auth/auth-context"

const queryClient = new QueryClient()

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AuthProvider>{children}</AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
