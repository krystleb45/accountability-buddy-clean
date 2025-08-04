// src/app/group-recommendations/page.tsx

import type { Metadata } from "next"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// SEO metadata
export const metadata: Metadata = {
  title: "Group Recommendations – Accountability Buddy",
  description:
    "Discover and join trending and recommended public groups to collaborate.",
  openGraph: {
    title: "Group Recommendations – Accountability Buddy",
    description:
      "Discover and join trending and recommended public groups to collaborate.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/group-recommendations`,
  },
}

// Dynamically load the client component
const RecommendationsClient = dynamic(() =>
  import("./page.client").then((mod) => mod.default),
)

export default async function RecommendationsPageWrapper() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <RecommendationsClient />
}
