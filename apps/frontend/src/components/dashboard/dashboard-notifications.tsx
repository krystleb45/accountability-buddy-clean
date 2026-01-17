"use client"

import { useQuery } from "@tanstack/react-query"
import { MessageCircle, UserPlus, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

import { http } from "@/lib/http"
import { Card, CardContent } from "@/components/ui/card"

interface NotificationCounts {
  unreadMessages: number
  pendingFriendRequests: number
  pendingGoalInvitations: number
}

async function fetchNotificationCounts(): Promise<NotificationCounts> {
  let unreadMessages = 0
  let pendingFriendRequests = 0
  let pendingGoalInvitations = 0

  try {
    // Fetch unread messages count - endpoint exists
    const messagesRes = await http.get("/messages/unread-count")
    unreadMessages = messagesRes.data?.data?.count || 0
  } catch {
    // Silently fail - user might not have access
  }

  try {
    // Fetch pending friend requests - count the array
    const friendsRes = await http.get("/friends/requests")
    const requests = friendsRes.data?.data?.requests || friendsRes.data?.data || []
    pendingFriendRequests = Array.isArray(requests) ? requests.length : 0
  } catch {
    // Silently fail
  }

  try {
    // Fetch pending goal invitations
    const goalInvitesRes = await http.get("/collaboration-goals/invitations")
    const invitations = goalInvitesRes.data?.data?.invitations || []
    pendingGoalInvitations = Array.isArray(invitations) ? invitations.length : 0
  } catch {
    // Silently fail
  }

  return {
    unreadMessages,
    pendingFriendRequests,
    pendingGoalInvitations,
  }
}

export function DashboardNotifications() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-notifications"],
    queryFn: fetchNotificationCounts,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  })

  const unreadMessages = data?.unreadMessages || 0
  const pendingFriendRequests = data?.pendingFriendRequests || 0
  const pendingGoalInvitations = data?.pendingGoalInvitations || 0
  const totalNotifications = unreadMessages + pendingFriendRequests + pendingGoalInvitations

  // Don't show anything if no notifications or still loading
  if (isLoading || totalNotifications === 0) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-primary/20">
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <span className="text-sm font-medium text-muted-foreground">
          You have updates:
        </span>

        <div className="flex flex-wrap gap-3">
          {unreadMessages > 0 && (
            <Link
              href="/messages"
              className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span>
                {unreadMessages} unread message{unreadMessages !== 1 ? "s" : ""}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}

          {pendingFriendRequests > 0 && (
            <Link
              href="/friends/requests"
              className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <UserPlus className="h-4 w-4 text-green-500" />
              <span>
                {pendingFriendRequests} friend request
                {pendingFriendRequests !== 1 ? "s" : ""}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}

          {pendingGoalInvitations > 0 && (
            <Link
              href="/group-goals"
              className="flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Users className="h-4 w-4 text-purple-500" />
              <span>
                {pendingGoalInvitations} group goal invite
                {pendingGoalInvitations !== 1 ? "s" : ""}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
