import type React from "react"

import { ShieldUser } from "lucide-react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  const isAdmin = session?.user?.role === "admin"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <section className="flex w-full flex-col gap-6">
        <header className="flex items-center gap-2 border-b pb-4">
          <ShieldUser className="size-10 text-primary" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </header>
        {children}
      </section>
    </SidebarProvider>
  )
}

export default AdminLayout
