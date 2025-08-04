// src/app/about-us/page.tsx
import type { Metadata } from "next"

import AboutUsClient from "@/components/AboutUsClient"

export const metadata: Metadata = {
  title: "About Us • Accountability Buddy",
  description:
    "Learn how Accountability Buddy empowers individuals to achieve their goals through accountability and community.",
  openGraph: {
    title: "About Us • Accountability Buddy",
    description:
      "Learn how Accountability Buddy empowers individuals to achieve their goals through accountability and community.",
    url: "https://your-domain.com/about-us",
    siteName: "Accountability Buddy",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://your-domain.com/og/about-us.png",
        width: 1200,
        height: 630,
        alt: "About Accountability Buddy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us • Accountability Buddy",
    description:
      "Learn how Accountability Buddy empowers individuals to achieve their goals through accountability and community.",
    images: ["https://your-domain.com/og/about-us.png"],
  },
}

export default function AboutUsPage() {
  return <AboutUsClient />
}
