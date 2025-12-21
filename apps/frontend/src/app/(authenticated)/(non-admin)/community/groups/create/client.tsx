"use client"

import type { Tag } from "emblor"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { TagInput } from "emblor"
import { ArrowLeft, HexagonIcon, Loader } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { createGroup } from "@/api/groups/group-api"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { categories } from "@/lib/categories"
import { getFileSchema } from "@/utils/zod-utils"

const createGroupSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(200),
  category: z.enum(categories.map((cat) => cat.id)),
  isPublic: z.boolean(),
  tags: z.array(z.string().max(20)).max(5),
  avatar: getFileSchema("Image"),
})

export type CreateGroupFormData = z.infer<typeof createGroupSchema>

function CreateGroupClient() {
  const form = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "study" as const,
      isPublic: true,
      tags: [] as string[],
      avatar: "",
    },
  })

  const [tags, setTags] = useState<Tag[]>(() => [])
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)
  const [filePreview, setFilePreview] = useState<string | undefined>()

  const handleDrop = (files: File[]) => {
    if (files.length === 0) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setFilePreview(e.target?.result)
      }
    }
    reader.readAsDataURL(files[0] as File)
  }

  const router = useRouter()
  const { mutate: createGroupMutate, isPending: isCreating } = useMutation({
    mutationFn: async (data: CreateGroupFormData) => createGroup(data),
    onSuccess: (data) => {
      form.reset()
      setTags([])
      toast.success("Group created successfully!")
      router.push(`/community/groups/${data._id}`)
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create group")
    },
  })

  const handleSubmit = (data: CreateGroupFormData) => {
    createGroupMutate(data)
  }

  return (
    <main className="flex flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/community/groups">
          <ArrowLeft /> Back to Groups
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <HexagonIcon size={36} className="text-primary" /> Groups
        </h1>
        <p className="text-muted-foreground">
          Join groups and connect with like-minded people
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
        >
          <div
            className={`
              grid grid-cols-1 gap-6
              md:grid-cols-2
            `}
          >
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
          </div>
          <div
            className={`
              grid grid-cols-1 gap-6
              md:grid-cols-2
            `}
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter group description"
                      className="sm:h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Avatar Image</FormLabel>
                  <FormControl>
                    <Dropzone
                      maxSize={1024 * 1024 * 5} // 5MB
                      accept={{ "image/*": [] }}
                      multiple={false}
                      onDrop={(files) => {
                        handleDrop(files)
                        field.onChange(files[0])
                      }}
                      onError={(err) => {
                        form.setError("avatar", { message: err.message })
                      }}
                      className="sm:h-40"
                      {...(field.value instanceof File
                        ? { src: [field.value] }
                        : {})}
                    >
                      <DropzoneEmptyState />
                      <DropzoneContent>
                        {filePreview && (
                          <Image
                            alt="Preview"
                            src={filePreview}
                            width={128}
                            height={128}
                            className={`
                              block size-32 rounded-full border object-contain
                              sm:aspect-square sm:h-full sm:w-auto
                            `}
                          />
                        )}
                      </DropzoneContent>
                    </Dropzone>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </Button>
        </motion.form>
      </Form>
    </main>
  )
}

export default CreateGroupClient
