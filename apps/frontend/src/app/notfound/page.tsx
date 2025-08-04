// src/app/not-found/page.tsx
import type { Metadata } from "next"

import NotFoundClient from "./page.client"

export const metadata: Metadata = {
  title: "404 – Page Not Found | Accountability Buddy",
  description: "Sorry, we couldn’t find that page. Let’s get you back home.",
  openGraph: {
    title: "404 – Page Not Found",
    description: "Sorry, we couldn’t find that page. Let’s get you back home.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/404`,
  },
}

export default function NotFoundPage() {
  return <NotFoundClient />
}
