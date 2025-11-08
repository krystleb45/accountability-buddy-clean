import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader, MailPlus, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { fetchGroupRecommendations, inviteMember } from "@/api/groups/group-api"

import { LoadingSpinner } from "../loading-spinner"
import { UserAvatar } from "../profile/user-avatar"
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

interface InviteMembersDialogProps {
  // used as trigger
  children: React.ReactNode
  groupId: string
}

export function InviteMembersDialog({
  children,
  groupId,
}: InviteMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [membersBeingInvited, setMembersBeingInvited] = useState<string[]>([])

  const {
    data: recommendations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group-recommendations", groupId],
    queryFn: () => fetchGroupRecommendations(groupId),
    enabled: open,
  })

  const queryClient = useQueryClient()
  const { mutate: inviteUser } = useMutation({
    mutationFn: async (userId: string) => inviteMember(groupId, userId),
    onMutate: (userId) => {
      setMembersBeingInvited((prev) => [...prev, userId])
    },
    onSettled: (_data, _error, userId) => {
      setMembersBeingInvited((prev) => prev.filter((id) => id !== userId))
    },
    onSuccess: () => {
      toast.success("Invitation sent")
      queryClient.invalidateQueries({
        queryKey: ["group-recommendations", groupId],
      })
      queryClient.invalidateQueries({
        queryKey: ["groupInvitations", groupId],
      })
    },
    onError: (error) => {
      toast.error("There was an error sending the invitation", {
        description: error.message,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>Invite members to your group</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid min-h-40 place-items-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="grid min-h-40 place-items-center py-10">
            <div className="text-center">
              <XCircle size={60} className="mx-auto mb-6 text-destructive" />
              <p className="mb-2">
                There was an error loading the recommendations.
              </p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <ItemGroup className="gap-4">
            {recommendations.map((user) => (
              <Item variant="outline" key={user._id}>
                <ItemMedia variant="image">
                  <UserAvatar
                    userId={user._id}
                    src={user.profileImage}
                    alt={user.name || user.username}
                    status={user.activeStatus}
                    size="sm"
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>@{user.username}</ItemTitle>
                  <ItemDescription>
                    <Link
                      href={`/member/${user.username}`}
                      className="no-underline"
                    >
                      View Profile
                    </Link>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    onClick={() => inviteUser(user._id)}
                    disabled={membersBeingInvited.includes(user._id)}
                  >
                    <MailPlus />
                    {membersBeingInvited.includes(user._id) ? (
                      <>
                        <Loader className="animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      "Send Invite"
                    )}
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            No recommendations available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
