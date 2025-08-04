// src/app/challenge/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import dynamic from "next/dynamic"

export const metadata: Metadata = {
  title: "Challenges • Accountability Buddy",
  description:
    "Browse and join public challenges to stay motivated and achieve your goals.",
  openGraph: {
    title: "Challenges • Accountability Buddy",
    description:
      "Browse and join public challenges to stay motivated and achieve your goals.",
    url: "https://your-domain.com/challenge",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Challenges • Accountability Buddy",
    description:
      "Browse and join public challenges to stay motivated and achieve your goals.",
  },
}

// Dynamically load the list UI (no SSR)
const ClientChallenges = dynamic(() => import("./client"))

// Server wrapper: simply render the client component
export default function ChallengePage(): ReactNode {
  return <ClientChallenges />
}
