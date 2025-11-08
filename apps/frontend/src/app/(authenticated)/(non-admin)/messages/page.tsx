import type { Metadata } from "next"

import MessagesClient from "./page.client"

export const metadata: Metadata = {
  title: "Messages • Accountability Buddy",
  description:
    "Chat with friends and groups in your accountability community. Send messages, share progress, and stay connected.",
}

export default function MessagesPage() {
  return <MessagesClient />
}
