import type { Metadata } from "next"

import GroupGoalsClient from "./page.client"

export const metadata: Metadata = {
  title: "Group Goals | Accountability Buddy",
  description: "Create and manage group goals with your friends",
}

export default function GroupGoalsPage() {
  return <GroupGoalsClient />
}
