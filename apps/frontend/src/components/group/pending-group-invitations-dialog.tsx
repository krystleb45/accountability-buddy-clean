import type { ReactNode } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckIcon, Loader, XCircle, XIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import {
  acceptGroupInvitation,
  fetchGroupInvitations,
  rejectGroupInvitation,
} from "@/api/groups/group-api"

import { LoadingSpinner } from "../loading-spinner"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "../ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

interface PendingGroupInvitationsProps {
  // used as trigger
  children: ReactNode
  groupId: string
}

export function PendingGroupInvitationsDialog({
  children,
  groupId,
}: PendingGroupInvitationsProps) {
  const { status } = useSession()
  const [open, setOpen] = useState(false)

  const [inProgressInvitations, setInProgressInvitations] = useState<string[]>(
    [],
  )

  const queryClient = useQueryClient()

  const {
    data: groupInvitations,
    isLoading: isLoadingGroupInvitations,
    error: groupInvitationsError,
  } = useQuery({
    queryKey: ["groupInvitations", groupId],
    queryFn: async () => fetchGroupInvitations(groupId),
    enabled: status === "authenticated" && !!groupId,
  })

  const { mutate: mutateAcceptInvitation } = useMutation({
    mutationFn: async (invitationId: string) =>
      acceptGroupInvitation(invitationId),
    onMutate: (invitationId) => {
      setInProgressInvitations((prev) => [...prev, invitationId])
    },
    onSettled: (_data, _error, invitationId) => {
      setInProgressInvitations((prev) =>
        prev.filter((id) => id !== invitationId),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groupInvitations", groupId],
      })
      queryClient.invalidateQueries({ queryKey: ["group", groupId] })
      toast.success("Request accepted")
    },
    onError: (error) => {
      toast.error(`Error accepting request`, {
        description: error.message,
      })
    },
  })

  const { mutate: mutateRejectInvitation } = useMutation({
    mutationFn: async (invitationId: string) =>
      rejectGroupInvitation(invitationId),
    onMutate: (invitationId) => {
      setInProgressInvitations((prev) => [...prev, invitationId])
    },
    onSettled: (_data, _error, invitationId) => {
      setInProgressInvitations((prev) =>
        prev.filter((id) => id !== invitationId),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groupInvitations", groupId],
      })
      toast.success("Request rejected")
    },
    onError: (error) => {
      toast.error(`Error rejecting request`, {
        description: error.message,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="border-b pb-4">
          <DialogTitle>Pending Invitations</DialogTitle>
          <DialogDescription>
            Manage pending invitations for this group
          </DialogDescription>
        </DialogHeader>

        {isLoadingGroupInvitations ? (
          <div className="grid min-h-40 place-items-center">
            <LoadingSpinner />
          </div>
        ) : groupInvitationsError ? (
          <div className="grid min-h-40 place-items-center py-10">
            <div className="text-center">
              <XCircle size={60} className="mx-auto mb-6 text-destructive" />
              <p className="mb-2">
                There was an error loading the invitations.
              </p>
              <p className="text-sm text-muted-foreground">
                {groupInvitationsError.message}
              </p>
            </div>
          </div>
        ) : groupInvitations && groupInvitations.length > 0 ? (
          <ItemGroup className="gap-4">
            {groupInvitations.map((invitation) => {
              const isRequest =
                invitation.groupId.createdBy === invitation.recipient._id
              const isInProgress = inProgressInvitations.includes(
                invitation._id,
              )

              return (
                <Item variant="outline" key={invitation._id}>
                  <ItemContent>
                    <ItemTitle>
                      {isRequest ? (
                        <>
                          Request to join from{" "}
                          <span className="font-semibold text-primary">
                            @{invitation.sender.username}
                          </span>
                        </>
                      ) : (
                        <>
                          Invited{" "}
                          <span className="font-semibold text-primary">
                            @{invitation.recipient.username}
                          </span>{" "}
                          to join
                        </>
                      )}
                    </ItemTitle>
                    <ItemDescription>
                      <Link
                        href={`/member/${isRequest ? invitation.sender.username : invitation.recipient.username}`}
                        className="no-underline"
                      >
                        View Profile
                      </Link>
                    </ItemDescription>
                  </ItemContent>
                  {isRequest && (
                    <ItemActions>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              disabled={isInProgress}
                              onClick={() =>
                                mutateAcceptInvitation(invitation._id)
                              }
                            >
                              {isInProgress ? (
                                <Loader className="animate-spin" />
                              ) : (
                                <CheckIcon />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Accept Request</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="destructive"
                              disabled={isInProgress}
                              onClick={() =>
                                mutateRejectInvitation(invitation._id)
                              }
                            >
                              {isInProgress ? (
                                <Loader className="animate-spin" />
                              ) : (
                                <XIcon />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            className={`
                              bg-destructive text-destructive-foreground
                            `}
                            arrowClassName="bg-destructive fill-destructive"
                          >
                            Decline Request
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </ItemActions>
                  )}
                </Item>
              )
            })}
          </ItemGroup>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            No pending invitations. Send some invites!
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
