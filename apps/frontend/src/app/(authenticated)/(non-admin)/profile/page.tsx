import type { Metadata } from "next"

import ProfileClient from "./page.client"

export const metadata: Metadata = {
  title: "Your Profile | Accountability Buddy",
  description: "View and update your personal profile information.",
}

export default async function ProfilePage() {
  return <ProfileClient />
}
