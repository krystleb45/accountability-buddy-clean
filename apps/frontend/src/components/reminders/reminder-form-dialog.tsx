"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Bell, CalendarIcon, Loader2, MessageSquare } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { ReminderWithGoal } from "@/api/reminder/reminder-api"

import { createReminder, updateReminder } from "@/api/reminder/reminder-api"
import { fetchSettings } from "@/api/settings/settings-api"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const reminderSchema = z.object({
  message: z.string().min(1, "Message is required").max(255),
  remindAt: z.date({ required_error: "Please select a date and time" }),
  remindTime: z.string().min(1, "Please select a time"),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  endRepeatAt: z.date().optional(),
  reminderType: z.enum(["email", "sms", "app"]).default("email"),
}).refine(
  (data) => {
    // If recurrence is set (not "none"), endRepeatAt is required
    if (data.recurrence !== "none" && !data.endRepeatAt) {
      return false
    }
    return true
  },
  {
    message: "End date is required for recurring reminders",
    path: ["endRepeatAt"],
  }
).refine(
  (data) => {
    // End date must be after start date
    if (data.endRepeatAt && data.remindAt && data.endRepeatAt <= data.remindAt) {
      return false
    }
    return true
  },
  {
    message: "End date must be after the start date",
    path: ["endRepeatAt"],
  }
)

type ReminderFormData = z.infer<typeof reminderSchema>

interface ReminderFormDialogProps {
  children: React.ReactNode
  goalId?: string
  goalTitle?: string
  reminder?: ReminderWithGoal
}

export function ReminderFormDialog({
  children,
  goalId,
  goalTitle,
  reminder,
}: ReminderFormDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const isEditing = !!reminder
  
  // Fetch settings to check if user has a phone number
  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    enabled: open, // Only fetch when dialog is open
  })
  
  const userHasPhone = !!settingsData?.phoneNumber

  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      message: reminder?.message || (goalTitle ? `Time to work on "${goalTitle}"` : ""),
      remindAt: reminder?.remindAt ? new Date(reminder.remindAt) : undefined,
      remindTime: reminder?.remindAt 
        ? format(new Date(reminder.remindAt), "HH:mm") 
        : "09:00",
      recurrence: reminder?.recurrence || "none",
      endRepeatAt: reminder?.endRepeatAt ? new Date(reminder.endRepeatAt) : undefined,
      reminderType: reminder?.reminderType || "email",
    },
  })

  const { mutate: saveReminder, isPending } = useMutation({
    mutationFn: async (data: ReminderFormData) => {
      // Combine date and time
      const [hours, minutes] = data.remindTime.split(":").map(Number)
      const remindAt = new Date(data.remindAt)
      remindAt.setHours(hours, minutes, 0, 0)

      if (isEditing) {
        return updateReminder(reminder._id, {
          message: data.message,
          remindAt: remindAt.toISOString(),
          recurrence: data.recurrence,
          endRepeatAt: data.endRepeatAt?.toISOString(),
          reminderType: data.reminderType,
        })
      } else {
        return createReminder({
          message: data.message,
          goalId,
          remindAt: remindAt.toISOString(),
          recurrence: data.recurrence,
          endRepeatAt: data.endRepeatAt?.toISOString(),
          reminderType: data.reminderType,
        })
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Reminder updated!" : "Reminder created!")
      queryClient.invalidateQueries({ queryKey: ["reminders"] })
      queryClient.invalidateQueries({ queryKey: ["goal-reminders", goalId] })
      setOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast.error("Failed to save reminder", { description: error.message })
    },
  })

  const onSubmit = (data: ReminderFormData) => {
    saveReminder(data)
  }

  const selectedReminderType = form.watch("reminderType")
  const selectedRecurrence = form.watch("recurrence")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Reminder" : "Add Reminder"}
          </DialogTitle>
          <DialogDescription>
            {goalTitle 
              ? `Set a reminder for "${goalTitle}"` 
              : "Create a reminder to stay on track"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What do you want to be reminded about?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="remindAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remindTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Don't repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End date for recurring reminders */}
            {selectedRecurrence !== "none" && (
              <FormField
                control={form.control}
                name="endRepeatAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Repeat Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Pick an end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("remindAt")
                            return startDate ? date <= startDate : date < new Date()
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When should this reminder stop repeating?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="reminderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms" disabled={!userHasPhone}>
                        <span className="flex items-center gap-2">
                          SMS
                          {!userHasPhone && (
                            <span className="text-xs text-muted-foreground">
                              (No phone number)
                            </span>
                          )}
                        </span>
                      </SelectItem>
                      <SelectItem value="app">In-App</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedReminderType === "sms" && userHasPhone ? (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        SMS will be sent to your registered phone number
                      </span>
                    ) : !userHasPhone ? (
                      <span>
                        Want SMS notifications?{" "}
                        <a href="/settings" className="text-primary underline">
                          Add your phone number in settings
                        </a>
                      </span>
                    ) : (
                      "How would you like to be notified?"
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    {isEditing ? "Update Reminder" : "Create Reminder"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
