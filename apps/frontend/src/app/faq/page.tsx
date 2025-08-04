// src/app/faq/page.tsx
import type { Metadata } from "next"

import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import FaqClient from "./page.client"

export const metadata: Metadata = {
  title: "FAQ • Accountability Buddy",
  description: "Frequently Asked Questions about Accountability Buddy.",
  openGraph: {
    title: "FAQ • Accountability Buddy",
    description: "Frequently Asked Questions about Accountability Buddy.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ • Accountability Buddy",
    description: "Frequently Asked Questions about Accountability Buddy.",
  },
}

export default async function FaqPage() {
  // 1) Require a logged-in user
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  // 2) Render the client component
  return <FaqClient />
}
