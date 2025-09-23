import type { Metadata } from "next"

import { FriendsClient } from "./page.client"

// Metadata
export const metadata: Metadata = {
  title: "Friends • Accountability Buddy",
  description:
    "Connect with friends, manage requests, and start chats to stay accountable.",
}

export default async function FriendsPage() {
  return <FriendsClient />
}
