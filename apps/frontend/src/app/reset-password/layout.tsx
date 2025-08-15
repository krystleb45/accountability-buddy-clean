import type { ReactNode } from "react"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { ROUTES } from "@/config/routing/routingConfig"

import { authOptions } from "../api/auth/[...nextauth]/route"

async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect(ROUTES.DASHBOARD)
  }

  return (
    <main className="grid min-h-screen place-items-center">{children}</main>
  )
}

export default Layout
