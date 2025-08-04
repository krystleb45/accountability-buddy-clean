// src/app/feedback/page.tsx
import type { Metadata } from "next"

import FeedbackClient from "./page.client"

export const metadata: Metadata = {
  title: "Feedback – Accountability Buddy",
  description:
    "We value your feedback! Let us know how we can improve your experience.",
  openGraph: {
    title: "Feedback – Accountability Buddy",
    description:
      "We value your feedback! Let us know how we can improve your experience.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/feedback`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedback – Accountability Buddy",
    description:
      "We value your feedback! Let us know how we can improve your experience.",
  },
}

export default function FeedbackPage() {
  return <FeedbackClient />
}
