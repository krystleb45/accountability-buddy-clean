// src/app/community/groups/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Groups • Accountability Buddy",
  description:
    "Join groups and connect with people who share your goals and interests.",
  openGraph: {
    title: "Groups • Accountability Buddy",
    description:
      "Join groups and connect with people who share your goals and interests.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/community/groups`,
  },
}

// Dynamically load the client component
const GroupsClient = dynamic(() => import("./page.client"))

export default async function GroupsPage(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <GroupsClient />
}
