// src/app/friends/page.tsx
import type { Metadata } from "next"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Metadata
export const metadata: Metadata = {
  title: "Friends • Accountability Buddy",
  description:
    "Connect with friends, manage requests, and start chats to stay accountable.",
  openGraph: {
    title: "Friends • Accountability Buddy",
    description:
      "Connect with friends, manage requests, and start chats to stay accountable.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/friends`,
  },
}

// Dynamically import the client component (no SSR)
const FriendsClient = dynamic(() => import("./page.client"))

export default async function FriendsPage() {
  // Protect the route
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  return <FriendsClient />
}
