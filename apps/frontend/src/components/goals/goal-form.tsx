"use client"

import type { Tag } from "emblor"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addYears, endOfYear, format } from "date-fns"
import { TagInput } from "emblor"
import { Bell, CalendarIcon, Loader, Plus, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { Goal } from "@/types/mongoose.gen"

import {
  createGoal,
  fetchUserGoalCategories,
  updateGoal,
} from "@/api/goal/goal-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const goalCreateSchema = z.object({
  title: z.string().min(1, "Please enter a title for your goal"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select or add a category for your goal"),
  dueDate: z.iso.datetime().min(1, "Please enter a dueDate for your goal"),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  visibility: z.enum(["public", "private"]).default("private"),
  enableReminders: z.boolean().default(true),
})

export type GoalCreateInput = z.infer<typeof goalCreateSchema>

interface GoalFormProps {
  goal?: Goal
}

export function GoalForm({ goal }: GoalFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mode = useMemo(() => (goal ? "edit" : "create"), [goal])

  const form = useForm({
    resolver: zodResolver(goalCreateSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      category: goal?.category || "",
      dueDate: goal?.dueDate || "",
      tags: goal?.tags || [],
      priority: goal?.priority || "medium",
      visibility: goal?.visibility || "private",
      enableReminders: true,
    },
  })

  const [tags, setTags] = useState<Tag[]>(() =>
    goal?.tags
      ? goal.tags.map((tag) => ({
          id: tag,
          text: tag,
        }))
      : [],
  )
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)
  const [categorySelectValue, setCategorySelectValue] = useState(
    goal?.category || "",
  )

  const { setValue } = form

  const {
    data: categories,
    isPending: isLoadingCategories,
    error: categoryError,
  } = useQuery({
    queryKey: ["goals", "categories"],
    queryFn: fetchUserGoalCategories,
  })

  const { mutate, isPending: isCreatingGoal } = useMutation({
    mutationFn: (data: GoalCreateInput) =>
      mode === "create" ? createGoal(data) : updateGoal(goal!._id, data),
    onSuccess: () => {
      toast.success(
        `Goal ${mode === "create" ? "created" : "updated"} successfully!`,
      )
      queryClient.invalidateQueries({
        queryKey: ["goals"],
      })

      if (mode === "create") {
        router.push("/goals")
      } else {
        router.push(`/goals/${goal!._id}`)
      }
    },
    onError: (error) => {
      toast.error(`Failed to ${mode === "create" ? "create" : "update"} goal`, {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: GoalCreateInput) => {
    mutate(data)
  }

  if (isLoadingCategories) {
    return (
      <div className="mt-20">
        <LoadingSpinner />
      </div>
    )
  }

  if (categoryError) {
    return (
      <div className="mt-20 text-center">
        <XCircle size={60} className="mx-auto mb-6 text-destructive" />
        <p className="mb-2">There was an error loading categories.</p>
        <p className="text-sm text-muted-foreground">{categoryError.message}</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`
          space-y-4
          sm:space-y-6
        `}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter your goal title" {...field} />
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
                  placeholder="Enter your goal description"
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
              <FormControl>
                {categories &&
                categories.length > 0 &&
                categorySelectValue !== "new" ? (
                  <Select
                    onValueChange={(value) => {
                      setCategorySelectValue(value)
                      if (value !== "new") {
                        field.onChange(value)
                      } else {
                        field.onChange("")
                      }
                    }}
                    defaultValue={categorySelectValue}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectSeparator />
                      <SelectItem value="new">
                        <span className="flex items-center gap-2">
                          <Plus size={16} />
                          Add new category
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Enter a new category"
                    {...field}
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setCategorySelectValue("")
                      }
                      field.onChange(e.target.value)
                    }}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
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
                    selected={new Date(field.value)}
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
                    setValue(
                      "tags",
                      (newTags as [Tag, ...Tag[]]).map((tag) => tag.text),
                    )
                  }}
                  activeTagIndex={activeTagIndex}
                  setActiveTagIndex={setActiveTagIndex}
                />
              </FormControl>
              <FormDescription>
                These are the tags to help you organize and search for your
                goals.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Goal Priority</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value || "medium"}
                  className="flex flex-col rounded-lg border p-3 shadow-sm"
                >
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem
                        value="high"
                        className="border-destructive text-destructive"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">High</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem
                        value="medium"
                        className="border-chart-3 text-chart-3"
                        indicatorClassName="*:fill-chart-3"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Medium</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <RadioGroupItem value="low" />
                    </FormControl>
                    <FormLabel className="font-normal">Low</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem
              className={`
                flex flex-row items-center justify-between rounded-lg border p-3
                shadow-sm
              `}
            >
              <div className="space-y-0.5">
                <FormLabel>Visibility</FormLabel>
                <FormDescription>
                  Make this goal visible to others (public).
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === "public"}
                  onCheckedChange={(value) =>
                    field.onChange(value ? "public" : "private")
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Reminder Toggle - Only show in create mode */}
        {mode === "create" && (
          <FormField
            control={form.control}
            name="enableReminders"
            render={({ field }) => (
              <FormItem
                className={`
                  flex flex-row items-center justify-between rounded-lg border p-3
                  shadow-sm
                `}
              >
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="space-y-0.5">
                    <FormLabel>Deadline Reminders</FormLabel>
                    <FormDescription>
                      Get email reminders 7 days, 3 days, and 1 day before the
                      due date.
                    </FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isCreatingGoal}>
          {isCreatingGoal ? (
            <>
              <Loader className="animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Goal"
          ) : (
            "Update Goal"
          )}
        </Button>
      </form>
    </Form>
  )
}
