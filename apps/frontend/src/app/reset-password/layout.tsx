import type { ReactNode } from "react"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "../api/auth/[...nextauth]/route"

async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="grid min-h-screen place-items-center">{children}</main>
  )
}

export default Layout
