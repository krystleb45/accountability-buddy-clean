import type { Tag } from "emblor"
import type { ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TagInput } from "emblor"
import { Loader } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { Group } from "@/types/mongoose.gen"

import { updateGroup } from "@/api/groups/group-api"
import { categories } from "@/lib/categories"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Switch } from "../ui/switch"
import { Textarea } from "../ui/textarea"

interface GroupDetailsChangeDialogProps {
  // used as trigger
  children: ReactNode
  currentGroupDetails: Group
}

const groupDetailsChangeSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
  category: z.enum(categories.map((cat) => cat.id)),
  tags: z.array(z.string().max(20)).max(5),
  isPublic: z.boolean(),
})
type GroupDetailsChangeData = z.infer<typeof groupDetailsChangeSchema>

export function GroupDetailsChangeDialog({
  children,
  currentGroupDetails,
}: GroupDetailsChangeDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(groupDetailsChangeSchema),
    defaultValues: {
      name: currentGroupDetails.name,
      description: currentGroupDetails.description || "",
      category: currentGroupDetails.category,
      tags: currentGroupDetails.tags || [],
      isPublic: currentGroupDetails.isPublic,
    },
  })

  const [tags, setTags] = useState<Tag[]>(() =>
    (currentGroupDetails.tags || []).map((tag) => ({ id: tag, text: tag })),
  )
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)

  const queryClient = useQueryClient()
  const { mutate: updateGroupDescriptionMutate, isPending: isUpdating } =
    useMutation({
      mutationFn: async (data: GroupDetailsChangeData) => {
        return updateGroup(currentGroupDetails._id, data)
      },
      onSuccess: async () => {
        toast.success("Group details updated successfully")
        await queryClient.invalidateQueries({
          queryKey: ["group", currentGroupDetails._id],
        })
        form.reset()
        setOpen(false)
      },
      onError: (error) => {
        toast.error("Error updating group details", {
          description: error.message,
        })
      },
    })

  const onSubmit = async (data: GroupDetailsChangeData) => {
    updateGroupDescriptionMutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Group Description</DialogTitle>
          <DialogDescription>
            Update the description for your group.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter group description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          description={category.description}
                        >
                          <category.icon /> {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      {...field}
                      value={field.value || []}
                      placeholder="Enter a tag"
                      tags={tags}
                      className="sm:min-w-[450px]"
                      styleClasses={{
                        input: "focus-visible:outline-hidden",
                      }}
                      setTags={(newTags) => {
                        setTags(newTags)
                        form.setValue(
                          "tags",
                          (newTags as [Tag, ...Tag[]]).map((tag) => tag.text),
                        )
                      }}
                      activeTagIndex={activeTagIndex}
                      setActiveTagIndex={setActiveTagIndex}
                    />
                  </FormControl>
                  <FormDescription>
                    These tags will help people find your group. (max 5 tags)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem
                  className={`
                    flex flex-row items-center justify-between rounded-lg border
                    p-3 shadow-sm
                  `}
                >
                  <div className="space-y-0.5">
                    <FormLabel>
                      Group Visibility - {field.value ? "Public" : "Private"}
                    </FormLabel>
                    <FormDescription>
                      {field.value
                        ? "Anyone can see and join this group."
                        : "Only invited members can join this group."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
