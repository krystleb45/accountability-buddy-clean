import type { Metadata } from "next"

import DashboardClient from "./page.client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard • Accountability Buddy",
  description:
    "Your personalized dashboard: track your goals, celebrate achievements, and engage with the community.",
}

export default async function DashboardPage() {
  return <DashboardClient />
}
