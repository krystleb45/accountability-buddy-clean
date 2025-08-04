// src/app/analytics/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Analytics Dashboard • Accountability Buddy",
  description:
    "Gain insights into platform performance: goals completed, milestones achieved, user activity, and revenue trends.",
  openGraph: {
    title: "Analytics Dashboard • Accountability Buddy",
    description:
      "Gain insights into platform performance: goals completed, milestones achieved, user activity, and revenue trends.",
    url: "https://your-domain.com/analytics",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Analytics Dashboard • Accountability Buddy",
    description:
      "Gain insights into platform performance: goals completed, milestones achieved, user activity, and revenue trends.",
  },
}

// dynamically load the client component
const AnalyticsClient = dynamic(() => import("./page.client"))

// server wrapper to enforce auth before loading client
export default async function AnalyticsPageWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <AnalyticsClient />
}
