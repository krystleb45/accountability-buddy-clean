"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2, Plus, Search, Trash2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { User } from "@/types/mongoose.gen"

import { userApi } from "@/api/users/user-api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebounce } from "@/hooks/use-debounce"

const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin", "moderator", "military"]),
})

type CreateUserFormValues = z.infer<typeof createUserSchema>

export function AdminUsersClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const search = searchParams.get("search") || ""

  const [searchTerm, setSearchTerm] = useState(search)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const queryClient = useQueryClient()
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Debounce search
  useEffect(() => {
    const params = searchParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams()
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1") // Reset to first page on new search
    router.replace(`?${params.toString()}`)
  }, [debouncedSearchTerm, searchParams, router])

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => userApi.getUsers(page, 20, search),
  })

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      toast.success("User created successfully")
      setIsAddUserOpen(false)
      form.reset()
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user")
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      toast.success("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user")
    },
  })

  const onSubmit = (values: CreateUserFormValues) => {
    createUserMutation.mutate(values)
  }

  const users = data?.users || []
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  }

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Username",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("username")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("role")}</div>
        ),
      },
      {
        accessorKey: "isVerified",
        header: "Verified",
        cell: ({ row }) => (row.getValue("isVerified") ? "Yes" : "No"),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const date = row.getValue("createdAt")
          return date ? new Date(date as string).toLocaleDateString() : "N/A"
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="text-right">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`
                      text-destructive
                      hover:bg-destructive/10 hover:text-destructive
                    `}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the user account and remove their data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteUserMutation.mutate(user._id)}
                      className={`
                        bg-destructive text-destructive-foreground
                        hover:bg-destructive/90
                      `}
                    >
                      {deleteUserMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )
        },
      },
    ],
    [deleteUserMutation],
  )

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="military">Military</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />{" "}
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex items-center">
        <div className="relative w-full max-w-sm">
          <Search
            // prettier-ignore
            className="absolute top-2.5 left-2 size-4 text-muted-foreground"
          />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Loader2 className="mx-auto size-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (p) => (
              <PaginationItem key={p}>
                <PaginationLink href={`?page=${p}`} isActive={page === p}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href={`?page=${page + 1}`}
              aria-disabled={page >= pagination.pages}
              className={
                page >= pagination.pages
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
