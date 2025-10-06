import type { ReactNode } from "react"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { RenewSubscriptionBanner } from "@/components/banners/renew-subscription-banner"
import { VerifyEmailBanner } from "@/components/banners/verify-email-banner"

import { authOptions } from "../api/auth/[...nextauth]/route"

export const dynamic = "force-dynamic"

async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  const isAdmin = session.user.role === "admin"

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col p-6">
      {!isAdmin && (
        <>
          <RenewSubscriptionBanner />
          <VerifyEmailBanner />
        </>
      )}
      {children}
    </div>
  )
}

export default Layout
