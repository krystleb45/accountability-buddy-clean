import type { Resolver } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader, Phone } from "lucide-react"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "../ui/form"
import { Input } from "../ui/input"

interface NotificationPrefsFormProps {
  currentPrefs: User["settings"]["notifications"]
  phoneNumber?: string
}

const notificationPrefsSchema = z.object({
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  weeklyDigest: z.boolean().default(true),
  phoneNumber: z.string().optional(),
}).refine((data) => {
  // If SMS is enabled, phone number is required
  if (data.sms && (!data.phoneNumber || data.phoneNumber.length < 10)) {
    return false
  }
  return true
}, {
  message: "Phone number is required for SMS notifications",
  path: ["phoneNumber"],
})

type NotificationPrefsFormData = z.infer<typeof notificationPrefsSchema>

export function NotificationPrefsForm({
  currentPrefs,
  phoneNumber,
}: NotificationPrefsFormProps) {
  const form = useForm<NotificationPrefsFormData>({
    resolver: zodResolver(
      notificationPrefsSchema,
    ) as Resolver<NotificationPrefsFormData>,
    defaultValues: {
      email: currentPrefs?.email ?? true,
      sms: currentPrefs?.sms ?? false,
      weeklyDigest: currentPrefs?.weeklyDigest ?? true,
      phoneNumber: phoneNumber ?? "",
    },
  })

  const queryClient = useQueryClient()

  const smsEnabled = form.watch("sms")

  const { mutate: saveNotificationPrefs, isPending: isSaving } = useMutation({
    mutationFn: async (data: NotificationPrefsFormData) => {
      const { phoneNumber: phone, ...notifications } = data
      return saveSettings({ 
        notifications,
        phoneNumber: phone,
      })
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

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
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

            {/* Phone Number Input - Shows when SMS is enabled */}
            {smsEnabled && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => {
                  return (
                    <FormItem className="ml-6 max-w-xs">
                      <FormLabel className="text-sm">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="(555) 555-5555"
                            className="pl-10"
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value)
                              field.onChange(formatted)
                            }}
                            maxLength={14}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        US phone numbers only. Standard message rates may apply.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            )}

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
