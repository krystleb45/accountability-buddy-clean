import type { Metadata } from "next"

import GroupsClient from "./page.client"

export const metadata: Metadata = {
  title: "Groups • Accountability Buddy",
  description:
    "Join groups and connect with people who share your goals and interests.",
}

export default async function GroupsPage() {
  return <GroupsClient />
}
