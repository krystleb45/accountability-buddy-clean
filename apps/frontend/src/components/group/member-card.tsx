import { ClockIcon } from "lucide-react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"

import type { User } from "@/types/mongoose.gen"

import { useGetCurrentTimeWithTimezone } from "@/hooks/use-get-current-time-with-timezone"

const MotionLink = motion.create(Link)

interface MemberCardProps {
  member: Pick<
    User,
    "location" | "name" | "_id" | "username" | "profileImage"
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
      <Image
        src={member.profileImage || "/default-avatar.svg"}
        alt={member.username || member.name || "User"}
        width={40}
        height={40}
        className="size-10 rounded-full border border-muted object-cover"
      />
      <div className="flex-1">
        <p className="font-medium">@{member.username}</p>
        <p className="text-xs text-muted-foreground">
          {isAdmin ? "Admin" : "Member"}
        </p>
        <p
          className={`
            mt-1 flex items-center gap-2 font-mono text-xs text-muted-foreground
          `}
        >
          <ClockIcon className="size-3" /> {currentTime}
        </p>
      </div>
    </MotionLink>
  )
}
