"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { Bell, BellOff, Clock, Pencil, Repeat, Trash2 } from "lucide-react"
import { toast } from "sonner"

import type { ReminderWithGoal } from "@/api/reminder/reminder-api"

import {
  deleteReminder,
  fetchUserReminders,
  updateReminder,
} from "@/api/reminder/reminder-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { ReminderFormDialog } from "./reminder-form-dialog"

interface RemindersListProps {
  goalId?: string
  goalTitle?: string
  showAddButton?: boolean
}

export function RemindersList({ goalId, goalTitle, showAddButton = true }: RemindersListProps) {
  const queryClient = useQueryClient()

  const { data: reminders, isLoading } = useQuery({
    queryKey: goalId ? ["goal-reminders", goalId] : ["reminders"],
    queryFn: () => fetchUserReminders(true),
    select: (data) =>
      goalId ? data.filter((r) => r.goal?._id === goalId) : data,
  })

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateReminder(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      queryClient.invalidateQueries({ queryKey: ["goal-reminders", goalId] })
      toast.success("Reminder updated")
    },
    onError: (error) => {
      toast.error("Failed to update reminder", { description: error.message })
    },
  })

  const { mutate: removeReminder } = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      queryClient.invalidateQueries({ queryKey: ["goal-reminders", goalId] })
      toast.success("Reminder deleted")
    },
    onError: (error) => {
      toast.error("Failed to delete reminder", { description: error.message })
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading reminders...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Reminders
            </CardTitle>
            <CardDescription>
              Get notified to stay on track with your goals
            </CardDescription>
          </div>
          {showAddButton && (
            <ReminderFormDialog goalId={goalId} goalTitle={goalTitle}>
              <Button size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </ReminderFormDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!reminders || reminders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reminders set</p>
            {showAddButton && (
              <ReminderFormDialog goalId={goalId} goalTitle={goalTitle}>
                <Button variant="outline" className="mt-4">
                  Create your first reminder
                </Button>
              </ReminderFormDialog>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <ReminderItem
                key={reminder._id}
                reminder={reminder}
                onToggle={(isActive) =>
                  toggleActive({ id: reminder._id, isActive })
                }
                onDelete={() => removeReminder(reminder._id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ReminderItemProps {
  reminder: ReminderWithGoal
  onToggle: (isActive: boolean) => void
  onDelete: () => void
}

function ReminderItem({ reminder, onToggle, onDelete }: ReminderItemProps) {
  const isPast = new Date(reminder.remindAt) < new Date()
  const isSent = reminder.isSent

  return (
    <div
      className={`
        flex items-center justify-between gap-4 rounded-lg border p-4
        ${!reminder.isActive ? "opacity-50" : ""}
        ${isSent ? "bg-muted/50" : ""}
      `}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{reminder.message}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(reminder.remindAt), "MMM d, yyyy 'at' h:mm a")}
          </span>
          {reminder.recurrence !== "none" && (
            <Badge variant="secondary" className="text-xs">
              <Repeat className="h-3 w-3 mr-1" />
              {reminder.recurrence}
            </Badge>
          )}
          {isSent && (
            <Badge variant="outline" className="text-xs">
              Sent {formatDistanceToNow(new Date(reminder.lastSent!), { addSuffix: true })}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Switch
                  checked={reminder.isActive}
                  onCheckedChange={onToggle}
                  disabled={isSent && reminder.recurrence === "none"}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {reminder.isActive ? "Disable reminder" : "Enable reminder"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ReminderFormDialog reminder={reminder}>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </ReminderFormDialog>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}