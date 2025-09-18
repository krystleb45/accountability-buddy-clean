import type { Metadata } from "next"

import SettingsClient from "./page.client"

export const metadata: Metadata = {
  title: "Settings | Accountability Buddy",
  description:
    "Manage your notification preferences, change password, or delete your account.",
}

export default async function SettingsPage() {
  return <SettingsClient />
}
