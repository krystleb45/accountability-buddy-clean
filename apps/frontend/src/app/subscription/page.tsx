// src/app/subscription/page.tsx

import type { Metadata } from "next"

import SubscriptionClient from "./page.client"

export const metadata: Metadata = {
  title: "Start Your Free Trial – Accountability Buddy",
  description:
    "Get full access to Accountability Buddy with a 7-day free trial, then just $14.99/month.",
  openGraph: {
    title: "Start Your Free Trial – Accountability Buddy",
    description:
      "Try Accountability Buddy free for 7 days. Enjoy unlimited goals, community support, analytics, rewards, and personalized coaching.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
  },
}

export default function SubscriptionPage() {
  return <SubscriptionClient />
}
