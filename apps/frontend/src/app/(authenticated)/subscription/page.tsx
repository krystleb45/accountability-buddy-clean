import type { Metadata } from "next"

import SubscriptionClient from "./page.client"

export const metadata: Metadata = {
  title: "Manage your subscription - Accountability Buddy",
  description: "Manage your subscription settings and preferences.",
}

export default function SubscriptionPage() {
  return <SubscriptionClient />
}
