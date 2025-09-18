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
} from "../ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface ProfileVisibilityFormProps {
  currentPrefs: User["settings"]["privacy"]["profileVisibility"]
}

const profileVisibilityOptions = [
  { value: "public", label: "Public" },
  { value: "friends", label: "Friends" },
  { value: "private", label: "Private" },
] as const

const profileVisibilitySchema = z.object({
  profileVisibility: z
    .enum(profileVisibilityOptions.map((option) => option.value))
    .default("public"),
})

type ProfileVisibilityFormData = z.infer<typeof profileVisibilitySchema>

export function ProfileVisibilityForm({
  currentPrefs,
}: ProfileVisibilityFormProps) {
  const form = useForm<ProfileVisibilityFormData>({
    resolver: zodResolver(
      profileVisibilitySchema,
    ) as Resolver<ProfileVisibilityFormData>,
    defaultValues: {
      profileVisibility: currentPrefs ?? "public",
    },
  })

  const queryClient = useQueryClient()

  const { mutate: saveProfileVisibility, isPending: isSaving } = useMutation({
    mutationFn: async (data: ProfileVisibilityFormData) => {
      return saveSettings({ privacy: data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast.success("Profile visibility settings saved.")
    },
    onError: (error: Error) => {
      toast.error(`Error saving preferences`, { description: error.message })
    },
  })

  const onSubmit = (data: ProfileVisibilityFormData) => {
    saveProfileVisibility(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="profileVisibility"
              render={({ field }) => (
                <FormItem className="max-w-sm">
                  <FormLabel>Who can see your profile?</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profileVisibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader className="animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
