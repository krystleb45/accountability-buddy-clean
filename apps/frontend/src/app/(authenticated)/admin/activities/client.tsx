"use client"

import { useQuery } from "@tanstack/react-query"
import { ChevronFirst, ChevronLast, Loader, XCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { fetchAllActivities } from "@/api/activity/activity-api"
import { ActivitiesTable } from "@/components/admin/activities-table"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { usePaginationModel } from "@/hooks/use-pagination-model"

export function AdminActivitiesDashboard() {
  const searchParams = useSearchParams()
  const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1

  const {
    data,
    isPending: loading,
    isRefetching,
    error,
  } = useQuery({
    queryKey: ["admin-activities", { page, limit: 50 }],
    queryFn: () => fetchAllActivities({ page, limit: 50 }),
    refetchInterval: 60_000, // Refetch every minute
    staleTime: 30_000, // Data is fresh for 30 seconds
  })

  const { activities, total } = data || {}

  const totalPages = total ? Math.ceil(total / 50) : 1

  const paginationModel = usePaginationModel({
    totalPages,
    currentPage: page,
  })

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </main>
    )
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading activities.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        {isRefetching && (
          <CardAction className="row-span-1">
            <Badge variant="secondary">
              <Loader className="animate-spin" />
              Refreshing...
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <ActivitiesTable activities={activities || []} />
        {total && totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              {paginationModel.map((page) => {
                switch (page.type) {
                  case "FIRST_PAGE_LINK":
                    return (
                      <PaginationItem key={page.key}>
                        <PaginationLink href={`?page=${page.value}`}>
                          <ChevronFirst />
                        </PaginationLink>
                      </PaginationItem>
                    )
                  case "PREVIOUS_PAGE_LINK":
                    return (
                      <PaginationItem key={page.key}>
                        <PaginationPrevious href={`?page=${page.value}`} />
                      </PaginationItem>
                    )
                  case "PAGE":
                    return (
                      <PaginationItem key={page.key}>
                        <PaginationLink
                          href={`?page=${page.value}`}
                          isActive={page.isActive}
                        >
                          {page.value}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  case "ELLIPSIS":
                    return (
                      <PaginationItem key={page.key}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  case "NEXT_PAGE_LINK":
                    return (
                      <PaginationItem key={page.key}>
                        <PaginationNext href={`?page=${page.value}`} />
                      </PaginationItem>
                    )
                  case "LAST_PAGE_LINK":
                    return (
                      <PaginationItem key={page.key}>
                        <PaginationLink href={`?page=${page.value}`}>
                          <ChevronLast />
                        </PaginationLink>
                      </PaginationItem>
                    )
                  default:
                    return null
                }
              })}
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}
