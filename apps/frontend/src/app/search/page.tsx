// src/app/search/page.tsx
import type { Metadata } from "next"

import SearchClient from "./page.client"

export const metadata: Metadata = {
  title: "Search – Accountability Buddy",
  description: "Search for users, goals, and more across Accountability Buddy.",
  openGraph: {
    title: "Search – Accountability Buddy",
    description:
      "Search for users, goals, and more across Accountability Buddy.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/search`,
  },
}

export default function SearchPage() {
  return <SearchClient />
}
