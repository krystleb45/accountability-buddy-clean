import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"

import type { Activity } from "@/types/mongoose.gen"

import { Badge } from "../ui/badge"
import { IdBadge } from "../ui/id-badge"

const columnHelper = createColumnHelper<Activity>()

export const activitiesColumns = [
  columnHelper.accessor("_id", {
    header: "ID",
    cell: (info) => <IdBadge id={info.getValue()} />,
  }),
  columnHelper.accessor("user", {
    header: "User",
    cell: (info) => {
      const user = info.getValue()
      if (!user) {
        return "N/A"
      }

      return <IdBadge id={user.toString()} />
    },
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => (
      <Badge className="text-xs font-medium tracking-widest uppercase">
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => {
      const value = info.getValue()

      if (!value) {
        return "N/A"
      }

      return format(new Date(value), "PPpp")
    },
  }),
]
