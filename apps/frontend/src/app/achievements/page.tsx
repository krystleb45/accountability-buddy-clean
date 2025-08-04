// app/achievements/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Your Achievements • Accountability Buddy",
  description:
    "View and celebrate the badges and milestones you’ve earned on Accountability Buddy.",
  // …openGraph, twitter, etc…
}

const AchievementsClient = dynamic(() => import("./page.client"))

export default async function AchievementsPage(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <AchievementsClient />
}
