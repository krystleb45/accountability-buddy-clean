import type { ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { updateGroupAvatar } from "@/api/groups/group-api"
import { getFileSchema } from "@/utils/zod-utils"

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
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../ui/shadcn-io/dropzone"

interface CoverChangeDialogProps {
  // used as trigger
  children: ReactNode
  groupId: string
}

const avatarCoverChangeSchema = z.object({
  image: getFileSchema("Image"),
})
type AvatarCoverChangeData = z.infer<typeof avatarCoverChangeSchema>

export function AvatarCoverChangeDialog({
  children,
  groupId,
}: CoverChangeDialogProps) {
  const [filePreview, setFilePreview] = useState<string | undefined>()
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(avatarCoverChangeSchema),
    defaultValues: {
      image: "",
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

  const queryClient = useQueryClient()
  const { mutate: uploadAvatarCoverImageMutate, isPending: isUploading } =
    useMutation({
      mutationFn: async (data: AvatarCoverChangeData) => {
        return updateGroupAvatar(groupId, data.image as File)
      },
      onSuccess: async () => {
        toast.success("Group avatar image updated successfully")
        await queryClient.invalidateQueries({ queryKey: ["group", groupId] })
        form.reset()
        setFilePreview(undefined)
        setOpen(false)
      },
      onError: (error) => {
        toast.error("Error uploading cover image", {
          description: error.message,
        })
      },
    })

  const onSubmit = async (data: AvatarCoverChangeData) => {
    uploadAvatarCoverImageMutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Group Avatar Image</DialogTitle>
          <DialogDescription>
            Select a new avatar image for your group.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar Image</FormLabel>
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
                        form.setError("image", { message: err.message })
                      }}
                      {...(field.value instanceof File
                        ? { src: [field.value] }
                        : {})}
                    >
                      <DropzoneEmptyState />
                      <DropzoneContent>
                        {filePreview && (
                          <div
                            className={`
                              relative size-32 overflow-hidden rounded-full
                              border
                            `}
                          >
                            <Image
                              alt="Preview"
                              src={filePreview}
                              fill
                              objectFit="cover"
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

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isUploading}>
                {isUploading ? <Loader className="animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
