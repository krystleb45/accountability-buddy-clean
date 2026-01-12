import type { Metadata } from "next"

import RemindersPage from "./reminders-page"

export const metadata: Metadata = {
  title: "Reminders | Accountability Buddy",
  description: "View and manage your goal deadline reminders",
}

export default function Page() {
  return <RemindersPage />
}
