"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Loader2, UserX } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { getBlockedUsers, unblockUser } from "@/api/block/block-api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function BlockedUsersCard() {
  const queryClient = useQueryClient()

  const {
    data: blockedUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
  })

  const unblockMutation = useMutation({
    mutationFn: unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] })
      toast.success("User unblocked successfully")
    },
    onError: () => {
      toast.error("Failed to unblock user")
    },
  })

  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban size={20} className="text-destructive" />
          Blocked Users
        </CardTitle>
        <CardDescription>
          Blocked users cannot send you friend requests or messages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Failed to load blocked users</p>
        ) : !blockedUsers || blockedUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t blocked anyone yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {blockedUsers.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.username}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <UserX size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.username}</p>
                    {user.name && (
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unblockMutation.mutate(user._id)}
                  disabled={unblockMutation.isPending}
                >
                  {unblockMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Unblock"
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
