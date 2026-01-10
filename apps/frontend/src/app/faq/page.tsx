import type { Metadata } from "next"

import FaqClient from "./page.client"

export const metadata: Metadata = {
  title: "FAQ • Accountability Buddy",
  description: "Frequently Asked Questions about Accountability Buddy.",
  openGraph: {
    title: "FAQ • Accountability Buddy",
    description: "Frequently Asked Questions about Accountability Buddy.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ • Accountability Buddy",
    description: "Frequently Asked Questions about Accountability Buddy.",
  },
}

export default function FaqPage() {
  return <FaqClient />
}