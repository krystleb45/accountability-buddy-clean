"use client"

import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useEffect } from "react"
import { toast } from "sonner"

import { fetchLeaderboard } from "@/api/gamification/gamification-api"

import { LoadingSpinner } from "../loading-spinner"

export interface UserPreview {
  id: string
  name: string
  avatarUrl?: string
  points: number
  rank: number
}

export function LeaderboardPreview() {
  const {
    data: topEntries,
    isPending,
    error,
  } = useQuery({
    queryKey: ["leaderboard", { page: 1, limit: 5 }],
    queryFn: () => fetchLeaderboard({ page: 1, limit: 5 }),
  })

  useEffect(() => {
    if (error) {
      toast.error("Error fetching leaderboard", {
        description: error.message,
      })
    }
  }, [error])

  if (isPending) {
    return <LoadingSpinner />
  }

  return (
    <ul className="space-y-2">
      {topEntries?.entries.length ? (
        topEntries.entries.map((l, rank) => (
          <li
            key={l._id}
            className="flex items-center justify-between rounded bg-muted p-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {rank === 0
                  ? "🥇"
                  : rank === 1
                    ? "🥈"
                    : rank === 2
                      ? "🥉"
                      : null}
              </span>
              <Image
                src={l.user.profileImage || "/default-avatar.png"}
                alt={l.user.username}
                width={32}
                height={32}
                className={`
                  size-8 overflow-hidden rounded-full border border-background
                  object-cover
                `}
              />
              <span className="font-medium">{l.user.username}</span>
            </div>
          </li>
        ))
      ) : (
        <li className="text-muted-foreground">
          There is no leaderboard data available.
        </li>
      )}
    </ul>
  )
}
