// src/components/Providers.tsx
"use client"

import type { ReactNode } from "react"

import { SessionProvider } from "next-auth/react"

import APIProvider from "@/context/data/APIContext"
import { NotificationProvider } from "@/context/ui/NotificationContext"

interface Props {
  children: ReactNode
}

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <APIProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </APIProvider>
    </SessionProvider>
  )
}
