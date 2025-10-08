import type { ReactNode } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { CheckIcon, HexagonIcon, Loader, XCircle, XIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import {
  acceptGroupInvitation,
  fetchUserGroupInvitations,
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
  ItemMedia,
  ItemTitle,
} from "../ui/item"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface PendingUserGroupInvitationsDialogProps {
  // used as trigger
  children: ReactNode
}

export function PendingUserGroupInvitationsDialog({
  children,
}: PendingUserGroupInvitationsDialogProps) {
  const { status } = useSession()
  const [open, setOpen] = useState(false)

  const [inProgressInvitations, setInProgressInvitations] = useState<string[]>(
    [],
  )

  const queryClient = useQueryClient()

  const {
    data: userGroupInvitations,
    isPending: isLoadingUserGroupInvitations,
    error: userGroupInvitationsError,
  } = useQuery({
    queryKey: ["userGroupInvitations"],
    queryFn: () => fetchUserGroupInvitations(),
    enabled: status === "authenticated" && open,
    select: (data) => data.filter((inv) => inv.status === "pending"),
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
        queryKey: ["userGroupInvitations"],
      })
      queryClient.invalidateQueries({ queryKey: ["myGroups"] })
      toast.success("Invitation accepted")
    },
    onError: (error) => {
      toast.error(`Error accepting invitation`, {
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
        queryKey: ["userGroupInvitations"],
      })
      toast.success("Invitation rejected")
    },
    onError: (error) => {
      toast.error(`Error rejecting invitation`, {
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

        {isLoadingUserGroupInvitations ? (
          <div className="grid min-h-40 place-items-center">
            <LoadingSpinner />
          </div>
        ) : userGroupInvitationsError ? (
          <div className="grid min-h-40 place-items-center py-10">
            <div className="text-center">
              <XCircle size={60} className="mx-auto mb-6 text-destructive" />
              <p className="mb-2">
                There was an error loading the invitations.
              </p>
              <p className="text-sm text-muted-foreground">
                {userGroupInvitationsError.message}
              </p>
            </div>
          </div>
        ) : userGroupInvitations && userGroupInvitations.length > 0 ? (
          <ItemGroup className="gap-4">
            {userGroupInvitations.map((invitation) => {
              const isRequest =
                invitation.groupId.createdBy === invitation.recipient._id
              const isInProgress = inProgressInvitations.includes(
                invitation._id,
              )

              return (
                <Item variant="outline" key={invitation._id}>
                  <ItemMedia variant="image">
                    {invitation.groupId.avatar ? (
                      <Image
                        src={invitation.groupId.avatar}
                        alt={invitation.groupId.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <HexagonIcon className="size-10 text-primary" />
                    )}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {isRequest ? (
                        <>
                          Requested to join{" "}
                          <span className="font-semibold text-primary">
                            {invitation.groupId.name}
                          </span>
                        </>
                      ) : (
                        <>
                          Invite to join{" "}
                          <span className="font-semibold text-primary">
                            {invitation.groupId.name}
                          </span>
                        </>
                      )}
                    </ItemTitle>
                    {invitation.createdAt && (
                      <ItemDescription>
                        {formatDistanceToNow(invitation.createdAt, {
                          addSuffix: true,
                        })}
                      </ItemDescription>
                    )}
                  </ItemContent>
                  {!isRequest && (
                    <ItemActions>
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
                    </ItemActions>
                  )}
                </Item>
              )
            })}
          </ItemGroup>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            No pending invitations.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
