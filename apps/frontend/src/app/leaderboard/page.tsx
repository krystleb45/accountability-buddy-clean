// src/app/leaderboard/page.tsx

import type { Metadata } from "next"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Leaderboard – Accountability Buddy",
  description: "See the top goal achievers and try to climb the leaderboard.",
  openGraph: {
    /* … */
  },
}

const LeaderboardClient = dynamic(() => import("./page.client"))

export default async function LeaderboardPageWrapper() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")
  return <LeaderboardClient />
}
