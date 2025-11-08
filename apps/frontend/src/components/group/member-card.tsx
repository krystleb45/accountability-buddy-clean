import { ClockIcon } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"

import type { User } from "@/types/mongoose.gen"

import { useGetCurrentTimeWithTimezone } from "@/hooks/use-get-current-time-with-timezone"

import { UserAvatar } from "../profile/user-avatar"

const MotionLink = motion.create(Link)

interface MemberCardProps {
  member: Pick<
    User,
    "location" | "name" | "_id" | "username" | "profileImage" | "activeStatus"
  > & { timezone?: string }
  isAdmin?: boolean
}

export function MemberCard({ member, isAdmin }: MemberCardProps) {
  const currentTime = useGetCurrentTimeWithTimezone(
    member.timezone || "UTC",
    "HH:mm",
  )

  return (
    <MotionLink
      href={`/member/${member.username}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        flex items-center gap-3 rounded-md p-2
        hover:bg-accent
      `}
    >
      <UserAvatar
        userId={member._id}
        src={member.profileImage}
        alt={member.username}
        status={member.activeStatus}
      />
      <div className="flex-1">
        <p className="font-medium">@{member.username}</p>
        <p className="text-xs text-muted-foreground">
          {isAdmin ? "Admin" : "Member"}
        </p>
        {member.location && (
          <p
            className={`
              mt-1 flex items-center gap-2 font-mono text-xs
              text-muted-foreground
            `}
          >
            <ClockIcon className="size-3" /> {currentTime}
          </p>
        )}
      </div>
    </MotionLink>
  )
}
