import type React from "react"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function NonAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  const isAdmin = session?.user.role === "admin"

  if (isAdmin) {
    redirect("/admin/dashboard")
  }

  return children
}

export default NonAdminLayout
