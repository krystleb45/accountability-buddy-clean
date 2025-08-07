"use client"

import type { ReactNode } from "react"

import { SessionProvider } from "next-auth/react"

import APIProvider from "@/context/data/APIContext"

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <APIProvider>{children}</APIProvider>
    </SessionProvider>
  )
}
