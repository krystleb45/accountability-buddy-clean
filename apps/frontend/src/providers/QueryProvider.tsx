// src/providers/QueryProvider.tsx
"use client"

import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import React from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// optional: keep refetch on reconnect / focus
if (typeof window !== "undefined") {
  window.addEventListener("online", () => onlineManager.setOnline(true))
  window.addEventListener("offline", () => onlineManager.setOnline(false))
  focusManager.setEventListener((handle) => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") handle()
    }
    window.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  })
}

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
