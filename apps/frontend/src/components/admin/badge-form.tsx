"use client"

import type { Resolver } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { addYears, endOfYear, format } from "date-fns"
import {
  ArrowRight,
  BadgeIcon,
  BadgePlusIcon,
  CalendarIcon,
  Loader,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { BadgeType } from "@/types/mongoose.gen"

import {
  createBadge,
  updateBadge,
  uploadBadgeIcon,
} from "@/api/badge/badge-api"
import { cn } from "@/lib/utils"
import { getFileSchema } from "@/utils/zod-utils"

import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../ui/shadcn-io/dropzone"

const BADGE_CONDITIONS = [
  "goal_completed", // e.g., complete 10 goals
  "helper", // e.g., help 5 users
  "milestone_achiever", // e.g., complete 10 milestones
  "consistency_master", // e.g., maintain a streak for 30 days
  "event_badge", // e.g., participate in a special event
] as const

const badgeCreateSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional(),
  bronzePointsToAward: z.coerce.number().min(0).default(0),
  silverPointsToAward: z.coerce.number().min(0).default(0),
  goldPointsToAward: z.coerce.number().min(0).default(0),
  conditionToMeet: z.enum(BADGE_CONDITIONS),
  bronzeAmountRequired: z.coerce.number().min(1).default(1),
  silverAmountRequired: z.coerce.number().min(1).default(5),
  goldAmountRequired: z.coerce.number().min(1).default(10),
  expiresAt: z.date().optional(),
  icon: getFileSchema("Icon"),
})

export type BadgeCreateInput = z.output<typeof badgeCreateSchema>

interface BadgeFormProps {
  badge?: BadgeType & { iconUrl?: string }
}

export function BadgeForm({ badge }: BadgeFormProps) {
  const [filePreview, setFilePreview] = useState<string | undefined>(
    () => badge?.iconUrl,
  )
  const mode = badge ? "edit" : "create"

  const form = useForm<BadgeCreateInput>({
    resolver: zodResolver(badgeCreateSchema) as Resolver<BadgeCreateInput>,
    defaultValues: {
      name: badge?.name ?? "",
      description: badge?.description ?? "",
      bronzePointsToAward: badge?.bronzePointsToAward ?? 0,
      silverPointsToAward: badge?.silverPointsToAward ?? 0,
      goldPointsToAward: badge?.goldPointsToAward ?? 0,
      conditionToMeet: badge?.conditionToMeet ?? "goal_completed",
      bronzeAmountRequired: badge?.bronzeAmountRequired ?? 1,
      silverAmountRequired: badge?.silverAmountRequired ?? 5,
      goldAmountRequired: badge?.goldAmountRequired ?? 10,
      expiresAt: badge?.expiresAt ? new Date(badge.expiresAt) : undefined,
      icon: badge?.iconUrl ?? "",
    },
  })

  const router = useRouter()

  const { mutate: uploadBadgeIconMutation, isPending: isUploading } =
    useMutation({
      mutationFn: (data: { id: string; icon: File }) => {
        return uploadBadgeIcon(data.id, data.icon)
      },
      onSuccess: () => {
        form.reset()
        setFilePreview(undefined)
        toast.success("Badge icon uploaded successfully")
        router.push("/admin/badges")
      },
      onError: (error) => {
        toast.error("Error uploading badge icon", {
          description: error.message,
        })
      },
    })

  const { mutate: createBadgeMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: BadgeCreateInput) => {
      return createBadge(data)
    },
    onSuccess: (data) => {
      toast.success("Badge created successfully")

      const icon = form.getValues("icon")
      uploadBadgeIconMutation({ id: data._id, icon: icon as File })
    },
    onError: (error) => {
      toast.error("Error creating badge", { description: error.message })
    },
  })

  const { mutate: updateBadgeMutation, isPending: isUpdating } = useMutation({
    mutationFn: (data: BadgeCreateInput) => {
      return updateBadge(badge!._id, data)
    },
    onSuccess: () => {
      toast.success("Badge updated successfully")

      if (filePreview !== badge?.iconUrl) {
        uploadBadgeIconMutation({
          id: badge!._id,
          icon: form.getValues("icon") as File,
        })
      } else {
        router.push("/admin/badges")
      }

      toast.success("Badge updated successfully")
    },
    onError: (error) => {
      toast.error("Error updating badge", { description: error.message })
    },
  })

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

  const onSubmit = (data: BadgeCreateInput) => {
    if (mode === "create") {
      createBadgeMutation(data)
    } else {
      updateBadgeMutation(data)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <h1
            className={`
              flex items-center gap-2 text-2xl font-medium
              [&_svg]:text-primary
            `}
          >
            {mode === "create" ? <BadgePlusIcon /> : <BadgeIcon />}
            {mode === "create" ? "Create" : "Update"} Badge
          </h1>

          <Button
            type="submit"
            disabled={isCreating || isUploading || isUpdating}
          >
            {isCreating || isUploading || isUpdating ? (
              <Loader className="animate-spin" />
            ) : null}
            {mode === "create" ? "Create" : "Update"} Badge <ArrowRight />
          </Button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter badge name" {...field} />
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
                <Input placeholder="Enter badge description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div
          className={`
            grid grid-cols-1 gap-4
            md:grid-cols-3
          `}
        >
          <FormField
            control={form.control}
            name="bronzePointsToAward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bronze Points to Award</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter points to award"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Points awarded to user upon earning the bronze badge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="silverPointsToAward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Silver Points to Award</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter points to award"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Points awarded to user upon earning the silver badge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="goldPointsToAward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gold Points to Award</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter points to award"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Points awarded to user upon earning the gold badge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="conditionToMeet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition to Meet</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger className="capitalize">
                    <SelectValue placeholder="Select condition to meet" />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_CONDITIONS.map((condition) => (
                      <SelectItem
                        key={condition}
                        value={condition}
                        className="capitalize"
                      >
                        {condition.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div
          className={`
            grid grid-cols-1 gap-4
            md:grid-cols-3
          `}
        >
          <FormField
            control={form.control}
            name="bronzeAmountRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bronze Amount Required</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter amount required"
                    min={1}
                    step={1}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of actions required to earn the bronze badge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="silverAmountRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Silver Amount Required</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter amount required"
                    min={1}
                    step={1}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of actions required to earn the silver badge.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="goldAmountRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gold Amount Required</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter amount required"
                    min={1}
                    step={1}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Number of actions required to earn the gold badge.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expiry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-20 p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date?.toISOString())
                    }}
                    disabled={{
                      before: new Date(),
                    }}
                    captionLayout="dropdown"
                    defaultMonth={
                      field.value ? new Date(field.value) : new Date()
                    }
                    startMonth={new Date()}
                    endMonth={endOfYear(addYears(new Date(), 50))} // show next 50 years
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
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
                    form.setError("icon", { message: err.message })
                  }}
                  {...(field.value === ""
                    ? {}
                    : {
                        src: [
                          typeof field.value === "string"
                            ? new File([field.value], "icon.png")
                            : field.value,
                        ],
                      })}
                >
                  <DropzoneEmptyState />
                  <DropzoneContent>
                    {filePreview && (
                      <div
                        className={`
                          relative size-32 overflow-hidden rounded-full border
                        `}
                      >
                        <Image
                          alt="Preview"
                          src={filePreview}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </DropzoneContent>
                </Dropzone>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
