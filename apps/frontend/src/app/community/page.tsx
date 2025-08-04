// src/app/community/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Communities • Accountability Buddy",
  description:
    "Join and participate in community chat rooms around shared goals.",
  openGraph: {
    title: "Communities • Accountability Buddy",
    description:
      "Join and participate in community chat rooms around shared goals.",
    url: "https://your-domain.com/community",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Communities • Accountability Buddy",
    description:
      "Join and participate in community chat rooms around shared goals.",
  },
}

// dynamically load the client list component
const ClientCommunities = dynamic(() => import("./client"))

export default async function CommunitiesPage(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <ClientCommunities />
}
