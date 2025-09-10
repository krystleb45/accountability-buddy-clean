import type { Metadata } from "next"

import GoalCreationClient from "./page.client"

export const metadata: Metadata = {
  title: "Create Goals • Accountability Buddy",
  description: "Set, track, and manage your goals with customizable reminders.",
}

export default function GoalCreationPage() {
  return <GoalCreationClient />
}
