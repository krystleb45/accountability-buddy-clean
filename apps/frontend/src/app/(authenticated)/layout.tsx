import type { ReactNode } from "react"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "../api/auth/[...nextauth]/route"
import { VerifyEmailBanner } from "./verify-email-banner"

export const dynamic = "force-dynamic"

async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  return (
    <>
      <VerifyEmailBanner />
      {children}
    </>
  )
}

export default Layout
