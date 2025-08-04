// src/app/badges/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Your Badges • Accountability Buddy",
  description:
    "See all the badges you’ve earned (and those you can still work for)!",
  openGraph: {
    title: "Your Badges • Accountability Buddy",
    description:
      "See all the badges you’ve earned (and those you can still work for)!",
    url: "https://your-domain.com/badges",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Badges • Accountability Buddy",
    description:
      "See all the badges you’ve earned (and those you can still work for)!",
  },
}

// Dynamically import the client component
const ClientBadgePage = dynamic(() => import("./client"))

export default async function BadgePageWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <ClientBadgePage />
}
