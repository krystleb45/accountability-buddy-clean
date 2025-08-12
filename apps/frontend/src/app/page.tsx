// src/app/page.tsx

import type { Metadata } from "next"

import { Home } from "./home"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

export const metadata: Metadata = {
  title: "Home • Accountability Buddy",
  description:
    "Join a community of doers and achievers. Track your goals, connect with others, and stay motivated.",
  openGraph: {
    title: "Welcome to Accountability Buddy",
    description: "Track your goals, connect with others, and stay motivated.",
    url: baseUrl,
    siteName: "Accountability Buddy",
    type: "website",
    images: [{ url: `${baseUrl}/og-homepage.png` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome to Accountability Buddy",
    description: "Track your goals, connect with others, and stay motivated.",
    images: [`${baseUrl}/twitter-homepage.png`],
  },
}

export default function HomePage() {
  return <Home />
}
