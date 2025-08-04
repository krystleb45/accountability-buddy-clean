// src/app/goals/page.tsx
import type { Metadata } from "next"

import GoalsClient from "./page.client"

export const metadata: Metadata = {
  title: "Goals Overview • Accountability Buddy",
  description:
    "View, edit, and analyze your goals to stay accountable and track progress.",
  openGraph: {
    title: "Goals Overview • Accountability Buddy",
    description:
      "View, edit, and analyze your goals to stay accountable and track progress.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/goals`,
  },
}

export default function GoalsPage() {
  return <GoalsClient />
}
