import type { Metadata } from "next"

import { AdminUsersClient } from "./client"

export const metadata: Metadata = {
  title: "Admin Dashboard | Users • Accountability Buddy",
}

export default function AdminUsersPage() {
  return <AdminUsersClient />
}
