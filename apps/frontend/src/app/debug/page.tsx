// src/app/debug/page.tsx
import type { Metadata } from "next"

import DebugClient from "./page.client"

export const metadata: Metadata = {
  title: "Debug Environment • Accountability Buddy",
  description:
    "Client-side environment variables (NEXT_PUBLIC_*) for debugging. Not indexed.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Debug Environment • Accountability Buddy",
    description:
      "Client-side environment variables (NEXT_PUBLIC_*) for debugging. Not indexed.",
    url: "https://your-domain.com/debug",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Debug Environment • Accountability Buddy",
    description:
      "Client-side environment variables (NEXT_PUBLIC_*) for debugging. Not indexed.",
  },
}

export default function DebugPage() {
  return <DebugClient />
}
