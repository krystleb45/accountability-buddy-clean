import type { Metadata } from "next"

import { CommunityClient } from "./client"

export const metadata: Metadata = {
  title: "Communities • Accountability Buddy",
  description:
    "Join and participate in community chat rooms around shared goals.",
}

export default function CommunitiesPage() {
  return <CommunityClient />
}
