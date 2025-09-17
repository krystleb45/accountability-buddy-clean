"use client"

import { useQuery } from "@tanstack/react-query"
import { BadgeMinus, XCircle } from "lucide-react"
import { use } from "react"

import { fetchBadgeById } from "@/api/badge/badge-api"
import { BadgeForm } from "@/components/admin/badge-form"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSubscription } from "@/hooks/useSubscription"

function BadgeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { isSubscriptionActive } = useSubscription()

  const {
    data: badge,
    isPending,
    error,
  } = useQuery({
    queryKey: ["admin-badges", id],
    queryFn: async () => fetchBadgeById(id),
    enabled: isSubscriptionActive,
  })

  if (isPending) {
    return (
      <div className="grid h-svh place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid h-dvh place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading badge type.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!badge) {
    return (
      <div className="grid h-dvh place-items-center">
        <div className="text-center">
          <BadgeMinus size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">Badge not found</p>
        </div>
      </div>
    )
  }

  return <BadgeForm badge={badge} />
}

export default BadgeEditPage
