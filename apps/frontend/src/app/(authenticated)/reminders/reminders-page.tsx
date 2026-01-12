"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ArrowLeft,
  Bell,
  Calendar,
  Loader,
  MoreVertical,
  Target,
  Trash2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { deleteReminder, fetchUserReminders } from "@/api/reminder/reminder-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Reminder {
  _id: string
  message: string
  remindAt: string
  reminderType: "email" | "sms" | "app"
  recurrence: "none" | "daily" | "weekly" | "monthly"
  isActive: boolean
  isSent: boolean
  goal?: {
    _id: string
    title: string
    dueDate?: string
    progress: number
  }
}

export default function RemindersPage() {
  const queryClient = useQueryClient()

  const {
    data: remindersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reminders"],
    queryFn: fetchUserReminders,
  })

  const { mutate: removeReminder, isPending: isDeleting } = useMutation({
    mutationFn: (reminderId: string) => deleteReminder(reminderId),
    onSuccess: () => {
      toast.success("Reminder deleted")
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
    },
    onError: (error) => {
      toast.error("Failed to delete reminder", {
        description: error.message,
      })
    },
  })

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">Failed to load reminders</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  // Defensive: ensure reminders is always an array
  const reminders: Reminder[] = Array.isArray(remindersData) 
    ? remindersData 
    : (remindersData as any)?.reminders || (remindersData as any)?.data || []

  const pendingReminders = reminders.filter((r) => !r.isSent)
  const sentReminders = reminders.filter((r) => r.isSent)

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Button variant="link" asChild className="gap-1 p-0 text-primary">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Your Reminders</h1>
          <p className="text-muted-foreground">
            Manage your goal deadline reminders
          </p>
        </div>
      </div>

      {/* Pending Reminders */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Upcoming ({pendingReminders.length})
        </h2>
        {pendingReminders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Bell className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No upcoming reminders</p>
              <p className="mt-1 text-sm">
                Reminders are automatically created when you set a goal with a
                due date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingReminders.map((reminder) => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                onDelete={() => removeReminder(reminder._id)}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </section>

      {/* Sent Reminders */}
      {sentReminders.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
            Sent ({sentReminders.length})
          </h2>
          <div className="space-y-3 opacity-60">
            {sentReminders.slice(0, 5).map((reminder) => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                onDelete={() => removeReminder(reminder._id)}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        </section>
      )}

      {/* Settings Link */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium">Notification Preferences</p>
            <p className="text-sm text-muted-foreground">
              Manage email, SMS, and weekly digest settings
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/settings">Go to Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ReminderCard({
  reminder,
  onDelete,
  isDeleting,
}: {
  reminder: Reminder
  onDelete: () => void
  isDeleting: boolean
}) {
  const isPast = new Date(reminder.remindAt) < new Date()

  return (
    <Card className={reminder.isSent ? "bg-muted/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{reminder.message}</CardTitle>
            {reminder.goal && (
              <CardDescription className="mt-1 flex items-center gap-1">
                <Target className="h-3 w-3" />
                <Link
                  href={`/goals/${reminder.goal._id}`}
                  className="hover:underline"
                >
                  {reminder.goal.title}
                </Link>
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(reminder.remindAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          {reminder.isSent && (
            <Badge variant="secondary" className="text-xs">
              Sent
            </Badge>
          )}
          {!reminder.isSent && isPast && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
          {reminder.recurrence !== "none" && (
            <Badge variant="outline" className="text-xs">
              {reminder.recurrence}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
