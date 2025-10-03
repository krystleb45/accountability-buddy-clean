import Image from "next/image"

import type { UserBadge } from "@/api/badge/badge-api"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardFooter } from "../ui/card"
import { Progress } from "../ui/progress"

interface BadgeCardProps {
  badge: UserBadge
}

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <Card className="gap-4 py-4 shadow-none">
      <CardContent className="px-4">
        <div className="flex flex-col items-center gap-2">
          <Image
            src={badge.badgeType.iconUrl || ""}
            alt={badge.badgeType.name}
            width={48}
            height={48}
            className={cn(
              "size-12 shrink-0 rounded-full border-2 object-cover",
              {
                "border-amber-700": badge.level === "Bronze",
                "border-gray-400": badge.level === "Silver",
                "border-yellow-400": badge.level === "Gold",
              },
            )}
          />
          <p className="text-center text-pretty">{badge.badgeType.name}</p>
        </div>
      </CardContent>
      {badge.level === "Gold" &&
      badge.progress &&
      badge.progress >= 100 ? null : (
        <CardFooter className="block border-t px-4 !pt-4">
          <Progress value={badge.progress} />
          <p className="mt-2 text-xs">
            <span className="text-muted-foreground">
              Progress to Next Level:
            </span>{" "}
            <strong>{badge.progress}%</strong>
          </p>
        </CardFooter>
      )}
    </Card>
  )
}
