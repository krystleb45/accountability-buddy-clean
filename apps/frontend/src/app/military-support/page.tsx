import type { Metadata } from "next"

import MilitarySupportPageClient from "./page.client"

export const metadata: Metadata = {
  title: "Military Support – Accountability Buddy",
  description:
    "Free military support resources and crisis help for active duty and veterans.",
}

export default async function MilitarySupportPage() {
  return <MilitarySupportPageClient />
}
