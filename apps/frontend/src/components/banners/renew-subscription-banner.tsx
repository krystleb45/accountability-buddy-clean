"use client"

import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/useSubscription"

export function RenewSubscriptionBanner() {
  const { subscriptionStatus, isSubscriptionActive, isLoading } =
    useSubscription()
  const pathname = usePathname()

  if (
    pathname === "/subscription" ||
    !subscriptionStatus ||
    isSubscriptionActive ||
    isLoading
  ) {
    return null
  }

  const message =
    subscriptionStatus === "past_due"
      ? "Your subscription is past due."
      : "Your subscription has expired or has been cancelled."

  return (
    <div
      className={`
        my-6 flex justify-center rounded-lg border !border-destructive
        bg-destructive/10 px-6 py-4
      `}
    >
      <div className="text-center">
        <p className="flex items-center gap-2 text-xl font-bold">
          <AlertCircle size={28} className="text-destructive" /> {message}
        </p>
        <Button variant="outline" className="group mt-4" asChild>
          <Link href="/subscription">Manage Subscription</Link>
        </Button>
      </div>
    </div>
  )
}
