import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { updateGoalProgress } from "@/api/goal/goal-api"

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Label } from "../ui/label"
import { Slider } from "../ui/slider"

const trackProgressSchema = z.object({
  progress: z.number().min(0).max(100),
})

type TrackProgressSchema = z.infer<typeof trackProgressSchema>

interface GoalTrackProgressDialogProps {
  goalId: string
  goalTitle: string
  currentProgress: number
  // This is used as the trigger
  children: React.ReactNode
}

export function GoalTrackProgressDialog({
  goalId,
  goalTitle,
  currentProgress,
  children,
}: GoalTrackProgressDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(trackProgressSchema),
    defaultValues: {
      progress: currentProgress,
    },
  })

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TrackProgressSchema) =>
      updateGoalProgress(goalId, data.progress),
    onSuccess: () => {
      setOpen(false)
      queryClient.invalidateQueries({
        queryKey: ["goals", goalId],
      })
      toast.success("Progress tracked successfully!")
    },
    onError: (error) => {
      toast.error("There was an error tracking progress.", {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: TrackProgressSchema) => {
    mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="mb-6 border-b p-6">
          <DialogTitle>Track Progress for {goalTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            Here you can track the progress of your goal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6">
              <FormField
                name="progress"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-2">Progress</FormLabel>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        step={1}
                        min={0}
                        max={100}
                      />
                    </FormControl>
                    <div className="mt-1 flex justify-between">
                      <Label className="w-[3ch] font-mono text-muted-foreground">
                        0
                      </Label>
                      <Label className="text-lg">{field.value}%</Label>
                      <Label className="w-[3ch] font-mono text-muted-foreground">
                        100
                      </Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6 border-t px-6 py-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader className="animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
