import type React from "react"

import { ShieldUser } from "lucide-react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  const isAdmin = session?.user?.role === "admin"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <main className="flex flex-col gap-6">
      <header className="flex items-center gap-2">
        <ShieldUser className="size-14 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </header>
      {children}
    </main>
  )
}

export default AdminLayout
