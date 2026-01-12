import type { Tag } from "emblor"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TagInput } from "emblor"
import { Loader } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { updateProfile } from "@/api/profile/profile-api"

import { Button } from "../ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"

interface EditInterestsFormProps {
  currentInterests?: string[] | undefined
  onCancel: () => void
}

const editInterestsSchema = z.object({
  interests: z
    .array(
      z
        .string()
        .min(2, { message: "Interest must be at least 2 characters." })
        .max(50, { message: "Interest must be at most 50 characters." }),
    )
    .max(20, { message: "You can add up to 20 interests." }),
})
type EditInterestsData = z.infer<typeof editInterestsSchema>

export function EditInterestsForm({
  currentInterests,
  onCancel,
}: EditInterestsFormProps) {
  const form = useForm({
    resolver: zodResolver(editInterestsSchema),
    defaultValues: {
      interests: currentInterests || [],
    },
  })

  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)
  const [tags, setTags] = useState<Tag[]>(
    currentInterests?.map((i) => ({ id: i, text: i })) || [],
  )

  const queryClient = useQueryClient()
  const { mutate: updateInterests, isPending: isUpdating } = useMutation({
    mutationFn: async (data: EditInterestsData) => {
      updateProfile({ interests: data.interests })
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

  const onSubmit = (data: EditInterestsData) => {
    updateInterests(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormControl>
                <TagInput
                  {...field}
                  placeholder="Type an interest and press Enter"
                  tags={tags}
                  className="sm:min-w-[450px]"
                  setTags={(newTags) => {
                    setTags(newTags)
                    field.onChange(
                      (newTags as [Tag, ...Tag[]]).map((t) => t.text),
                    )
                  }}
                  activeTagIndex={activeTagIndex}
                  setActiveTagIndex={setActiveTagIndex}
                  maxTags={20}
                  allowDuplicates={false}
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
