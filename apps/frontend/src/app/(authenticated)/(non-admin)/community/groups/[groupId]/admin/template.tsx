"use client"

import type { PropsWithChildren } from "react"

import { useQuery } from "@tanstack/react-query"
import { OctagonMinusIcon, XCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"

import { fetchGroupDetails } from "@/api/groups/group-api"
import { LoadingSpinner } from "@/components/loading-spinner"

interface GroupAdminCheckProps extends PropsWithChildren {}

export default function GroupAdminCheck({ children }: GroupAdminCheckProps) {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const { groupId } = useParams<{ groupId: string }>()

  const {
    data: group,
    isLoading: isFetchingGroup,
    error,
  } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => fetchGroupDetails(groupId),
    enabled: !!groupId && !!userId,
  })

  const isAdmin = group?.createdBy._id === userId
  const isLoading = status === "loading" || isFetchingGroup

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading the group.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <OctagonMinusIcon
            size={60}
            className="mx-auto mb-6 text-destructive"
          />
          <p className="mb-2">You are not an admin of this group.</p>
        </div>
      </div>
    )
  }

  return children
}
