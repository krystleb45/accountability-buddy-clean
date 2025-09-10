import type { Metadata } from "next"

import { ClientAdminDashboard } from "./client"

export const metadata: Metadata = {
  title: "Admin Dashboard • Accountability Buddy",
  description:
    "Overview of site metrics, recent activities, and user management.",
}

export default async function AdminDashboardWrapper() {
  return <ClientAdminDashboard />
}
