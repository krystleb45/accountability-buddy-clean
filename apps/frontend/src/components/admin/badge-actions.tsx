import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader, MoreVerticalIcon, Pencil, Trash } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { deleteBadge } from "@/api/badge/badge-api"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

export function BadgeActions({ id }: { id: string }) {
  const queryClient = useQueryClient()

  const { mutate: deleteBadgeMutation, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return deleteBadge(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] })
      toast.success("Badge deleted successfully.")
    },
    onError: (error) => {
      toast.error("Failed to delete badge. Please try again.", {
        description: error.message,
      })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/badges/${id}/edit`}>
            <Pencil />
            Edit Badge
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => deleteBadgeMutation()}
          disabled={isDeleting}
        >
          <Trash /> Delete Badge{" "}
          {isDeleting ? <Loader className="animate-spin" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
