// app/welcome/page.tsx

import type { Metadata } from "next"

import dynamic from "next/dynamic"

export const metadata: Metadata = {
  title: "Welcome – Accountability Buddy",
  description:
    "Welcome to Accountability Buddy! Start setting your goals and connecting with accountability partners today.",
  openGraph: {
    title: "Welcome – Accountability Buddy",
    description:
      "Welcome to Accountability Buddy! Start setting your goals and connecting with accountability partners today.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/welcome`,
  },
}

// Dynamically import the client‐only welcome UI (disable SSR)
const WelcomeClient = dynamic(() => import("./page.client"))

export default function WelcomePage() {
  return <WelcomeClient />
}
