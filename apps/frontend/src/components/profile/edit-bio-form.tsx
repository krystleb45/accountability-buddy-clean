import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { updateProfile } from "@/api/profile/profile-api"

import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Textarea } from "../ui/textarea"

interface EditBioFormProps {
  currentBio?: string | undefined
  onCancel: () => void
}

const editBioSchema = z.object({
  bio: z
    .string()
    .min(10, { message: "Bio must be at least 10 characters." })
    .max(300, { message: "Bio must be at most 300 characters." }),
})
type EditBioData = z.infer<typeof editBioSchema>

export function EditBioForm({ currentBio, onCancel }: EditBioFormProps) {
  const form = useForm({
    resolver: zodResolver(editBioSchema),
    defaultValues: {
      bio: currentBio || "",
    },
  })

  const queryClient = useQueryClient()
  const { mutate: updateBio, isPending: isUpdating } = useMutation({
    mutationFn: async (data: EditBioData) => {
      updateProfile({ bio: data.bio })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] })
      form.reset()
      onCancel()
    },
    onError: (error: Error) => {
      toast.error("Error updating bio", { description: error.message })
    },
  })

  const onSubmit = (data: EditBioData) => {
    updateBio(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write something about yourself..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={`
          flex justify-end gap-2
          *:flex-1
          md:*:flex-none
        `}>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isUpdating ? (
              <>
                <Loader className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
