"use client"

import { useQuery } from "@tanstack/react-query"
import { Plus, XCircle } from "lucide-react"
import Link from "next/link"

import { fetchAllBadges } from "@/api/badge/badge-api"
import { BadgesTable } from "@/components/admin/badges-tables"
import { CardContent } from "@/components/cards"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminBadgeDashboard() {
  const {
    data: badges,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-badges"],
    queryFn: fetchAllBadges,
  })

  if (isLoading) {
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
          <p className="mb-2">There was an error loading badge types.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badge Management</CardTitle>
        <CardAction>
          <Button asChild variant="outline">
            <Link href="/admin/badges/create">
              <Plus /> Create Badge
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <BadgesTable badges={badges} />
      </CardContent>
    </Card>
  )
}
