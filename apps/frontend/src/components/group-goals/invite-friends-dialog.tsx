"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Loader2, Search, UserPlus, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { fetchFriends } from "@/api/friends/friend-api"
import { sendGoalInvitations } from "@/api/collaboration-goals/collaboration-goal-api"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InviteFriendsDialogProps {
  children: React.ReactNode
  goalId: string
  goalTitle: string
}

export function InviteFriendsDialog({
  children,
  goalId,
  goalTitle,
}: InviteFriendsDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const queryClient = useQueryClient()

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    enabled: open,
  })

  const { mutate: sendInvitations, isPending: sending } = useMutation({
    mutationFn: () => sendGoalInvitations(goalId, selectedFriends, message || undefined),
    onSuccess: (invitations) => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-goals"] })
      toast.success(`Invited ${invitations.length} friend${invitations.length !== 1 ? "s" : ""}!`)
      setOpen(false)
      setSelectedFriends([])
      setMessage("")
    },
    onError: (error: Error) => {
      toast.error("Failed to send invitations", { description: error.message })
    },
  })

  const filteredFriends = (friends || []).filter((friend) =>
    (friend.name || friend.username)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleSend = () => {
    if (selectedFriends.length === 0) {
      toast.error("Please select at least one friend to invite")
      return
    }
    sendInvitations()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite Friends
          </DialogTitle>
          <DialogDescription>
            Invite friends to join "{goalTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Friends List */}
          <ScrollArea className="h-[200px] rounded-md border p-2">
            {friendsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Users className="mb-2 h-8 w-8" />
                <p className="text-sm">
                  {friends?.length === 0
                    ? "No friends yet. Add friends first!"
                    : "No friends match your search"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFriends.map((friend) => {
                  const isSelected = selectedFriends.includes(friend._id)
                  return (
                    <div
                      key={friend._id}
                      className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted ${
                        isSelected ? "bg-primary/10" : ""
                      }`}
                      onClick={() => toggleFriend(friend._id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleFriend(friend._id)}
                      />
                      <UserAvatar
                        userId={friend._id}
                        src={friend.profileImage}
                        alt={friend.username}
                        className="h-8 w-8"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {friend.name || friend.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{friend.username}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Selected Count */}
          {selectedFriends.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedFriends.length} friend{selectedFriends.length !== 1 ? "s" : ""} selected
            </p>
          )}

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="invite-message">
              Custom Message (optional)
            </Label>
            <Textarea
              id="invite-message"
              placeholder="Add a personal message to your invitation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || selectedFriends.length === 0}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitations
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
