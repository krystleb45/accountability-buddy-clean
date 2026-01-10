import type { Resolver } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { User } from "@/types/mongoose.gen"

import { saveSettings } from "@/api/settings/settings-api"

import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "../ui/form"

interface NotificationPrefsFormProps {
  currentPrefs: User["settings"]["notifications"]
}

const notificationPrefsSchema = z.object({
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  weeklyDigest: z.boolean().default(true),
})

type NotificationPrefsFormData = z.infer<typeof notificationPrefsSchema>

export function NotificationPrefsForm({
  currentPrefs,
}: NotificationPrefsFormProps) {
  const form = useForm<NotificationPrefsFormData>({
    resolver: zodResolver(
      notificationPrefsSchema,
    ) as Resolver<NotificationPrefsFormData>,
    defaultValues: {
      email: currentPrefs?.email ?? true,
      sms: currentPrefs?.sms ?? false,
      weeklyDigest: currentPrefs?.weeklyDigest ?? true,
    },
  })

  const queryClient = useQueryClient()

  const { mutate: saveNotificationPrefs, isPending: isSaving } = useMutation({
    mutationFn: async (data: NotificationPrefsFormData) => {
      return saveSettings({ notifications: data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast.success("Notification preferences saved.")
    },
    onError: (error: Error) => {
      toast.error(`Error saving preferences`, { description: error.message })
    },
  })

  const onSubmit = (data: NotificationPrefsFormData) => {
    saveNotificationPrefs(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to receive updates and reminders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false)
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Email Notifications
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="sms"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false)
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      SMS Notifications
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="weeklyDigest"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-row items-start gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange(true)
                            : field.onChange(false)
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Weekly Progress Digest
                      </FormLabel>
                      <FormDescription>
                        Receive a weekly summary of your goals, streaks, and achievements every Monday.
                      </FormDescription>
                    </div>
                  </FormItem>
                )
              }}
            />
          </CardContent>
          <CardFooter className="border-t">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader className="animate-spin" />}
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}