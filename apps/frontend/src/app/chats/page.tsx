// src/app/chats/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Chat • Accountability Buddy",
  description: "Connect one-on-one with your friends in real time.",
  openGraph: {
    title: "Chat • Accountability Buddy",
    description: "Connect one-on-one with your friends in real time.",
    url: "https://your-domain.com/chats",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Chat • Accountability Buddy",
    description: "Connect one-on-one with your friends in real time.",
  },
}

// Dynamically import the chat UI (client-side only) - REMOVED { ssr: false }
const ClientChat = dynamic(() => import("./client"))

export default async function ChatPageWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <ClientChat />
}
