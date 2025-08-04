// src/app/admin-management/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// ——— SEO Metadata —————————————————————————————————————————————
export const metadata: Metadata = {
  title: "Admin Management • Accountability Buddy",
  description: "Manage roles, permissions, and platform-level settings.",
  openGraph: {
    title: "Admin Management • Accountability Buddy",
    description: "Manage roles, permissions, and platform-level settings.",
    url: "https://your-domain.com/admin-management",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Management • Accountability Buddy",
    description: "Manage roles, permissions, and platform-level settings.",
  },
}

// ——— Extend session.user with role —————————————————————————————————
interface CustomSessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

// ——— Dynamically load the client UI —————————————————————————————————
const ClientAdminManagement = dynamic(() => import("./client"))

// ——— Server wrapper with auth & role guard ——————————————————————————
export default async function AdminManagementWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)

  // Only allow admins
  if (!session || (session.user as CustomSessionUser).role !== "admin") {
    redirect("/unauthorized")
  }

  return <ClientAdminManagement />
}
