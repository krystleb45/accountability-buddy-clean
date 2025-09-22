import type { Metadata } from "next"

import { DiscoverClient } from "./client"

export const metadata: Metadata = {
  title: "Discover Friends • Accountability Buddy",
  description: "Find new accountability partners and expand your network.",
}

export default async function DiscoverPage() {
  return <DiscoverClient />
}
