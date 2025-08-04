// src/app/statistics/page.tsx
import type { Metadata } from "next"

import StatisticsClient from "./page.client"

export const metadata: Metadata = {
  title: "Your Statistics – Accountability Buddy",
  description: "See your goal progress, streaks, achievements, and more.",
  openGraph: {
    title: "Your Statistics – Accountability Buddy",
    description: "See your goal progress, streaks, achievements, and more.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/statistics`,
  },
}

export default function StatisticsPage() {
  return <StatisticsClient />
}
