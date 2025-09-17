import type { Metadata } from "next"

import { AdminActivitiesDashboard } from "./client"

export const metadata: Metadata = {
  title: "Admin Dashboard | Activities • Accountability Buddy",
}

export default async function AdminDashboardWrapper() {
  return <AdminActivitiesDashboard />
}
