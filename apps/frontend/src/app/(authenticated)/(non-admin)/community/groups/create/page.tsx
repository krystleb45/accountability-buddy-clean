import type { Metadata } from "next"

import CreateGroupClient from "./client"

export const metadata: Metadata = {
  title: "Create Group • Accountability Buddy",
  description:
    "Create a new group to connect with like-minded people and achieve your goals together.",
}

export default async function CreateGroupPage() {
  return <CreateGroupClient />
}
