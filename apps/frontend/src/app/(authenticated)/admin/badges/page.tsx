import type { Metadata } from "next"

import { AdminBadgeDashboard } from "./client"

export const metadata: Metadata = {
  title: "Admin Dashboard | Badges • Accountability Buddy",
}

export default async function AdminDashboardWrapper() {
  return <AdminBadgeDashboard />
}
