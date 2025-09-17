import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"
import { BadgeIcon } from "lucide-react"
import Image from "next/image"

import type { BadgeType } from "@/types/mongoose.gen"

import { Badge } from "../ui/badge"
import { IdBadge } from "../ui/id-badge"
import { BadgeActions } from "./badge-actions"

const columnHelper = createColumnHelper<
  BadgeType & {
    iconUrl?: string
  }
>()

export const badgesColumns = [
  columnHelper.accessor("_id", {
    header: "ID",
    cell: (info) => <IdBadge id={info.getValue()} />,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => {
      const name = info.getValue()
      const iconUrl = info.row.original.iconUrl
      return (
        <div className="flex items-center gap-2">
          {iconUrl && (
            <Image
              src={iconUrl}
              alt={`${name} icon`}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full border object-cover"
            />
          )}
          <span>{name}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: "points",
    header: "Points",
    cell: (info) => {
      const bronzePoints = info.row.original.bronzePointsToAward || 0
      const silverPoints = info.row.original.silverPointsToAward || 0
      const goldPoints = info.row.original.goldPointsToAward || 0

      return (
        <div
          className={`
            flex flex-col gap-2
            *:flex *:items-center *:gap-1
            [&_svg]:size-5
          `}
        >
          <span>
            <BadgeIcon className="text-amber-700" /> {bronzePoints}
          </span>
          <span>
            <BadgeIcon className="text-gray-400" /> {silverPoints}
          </span>
          <span>
            <BadgeIcon className="text-yellow-500" /> {goldPoints}
          </span>
        </div>
      )
    },
  }),
  columnHelper.accessor("conditionToMeet", {
    header: "Condition",
    cell: (info) => (
      <Badge variant={info.getValue() ? "outline" : "secondary"}>
        {info.getValue() || "N/A"}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: "amount",
    header: "Amount Required",
    cell: (info) => {
      const bronzeAmountRequired = info.row.original.bronzeAmountRequired || 0
      const silverAmountRequired = info.row.original.silverAmountRequired || 0
      const goldAmountRequired = info.row.original.goldAmountRequired || 0

      return (
        <div
          className={`
            flex flex-col gap-2
            *:flex *:items-center *:gap-1
            [&_svg]:size-5
          `}
        >
          <span>
            <BadgeIcon className="text-amber-700" /> {bronzeAmountRequired}
          </span>
          <span>
            <BadgeIcon className="text-gray-400" /> {silverAmountRequired}
          </span>
          <span>
            <BadgeIcon className="text-yellow-500" /> {goldAmountRequired}
          </span>
        </div>
      )
    },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At",
    cell: (info) => {
      const value = info.getValue()

      if (!value) {
        return "N/A"
      }

      return format(value, "PPpp")
    },
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated At",
    cell: (info) => {
      const value = info.getValue()

      if (!value) {
        return "N/A"
      }

      return format(value, "PPpp")
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: (info) => <BadgeActions id={info.row.original._id} />,
  }),
]
