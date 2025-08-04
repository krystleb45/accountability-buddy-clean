// File: src/app/point-shop/[rewardId]/page.tsx
import type { Metadata } from "next"

import dynamic from "next/dynamic"

import { fetchRewards } from "@/api/reward/rewardApi"

interface Params {
  params: { rewardId: string }
}

// 1️⃣ Server‐only: generate SEO metadata
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  let title = "Reward Details – Accountability Buddy"
  let description = "Redeem your selected reward."

  try {
    const all = await fetchRewards()
    const found = all.find((r) => r.id === params.rewardId)
    if (found) {
      title = `${found.title} – Redeem | Accountability Buddy`
      description = found.description ?? description
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/point-shop/${params.rewardId}`,
        },
      }
    }
  } catch {
    // fallback to default
  }

  return { title, description }
}

// 2️⃣ Dynamically load the client detail component - REMOVED { ssr: false }
const RewardDetailClient = dynamic(() => import("./page.client"))

export default function Page({ params }: Params) {
  // just hand off to the client component
  return <RewardDetailClient rewardId={params.rewardId} />
}
