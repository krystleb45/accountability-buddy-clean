import type { ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { uploadAvatarImage, uploadCoverImage } from "@/api/profile/profile-api"
import { cn } from "@/lib/utils"
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
  type: "avatar" | "cover"
}

const avatarCoverChangeSchema = z.object({
  image: getFileSchema("Image"),
})
type AvatarCoverChangeData = z.infer<typeof avatarCoverChangeSchema>

export function AvatarCoverChangeDialog({
  children,
  type,
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
        if (type === "cover") {
          uploadCoverImage(data.image as File)
        } else {
          uploadAvatarImage(data.image as File)
        }
      },
      onSuccess: async () => {
        toast.success(
          `${type === "cover" ? "Cover" : "Avatar"} image updated successfully`,
        )
        await queryClient.invalidateQueries({ queryKey: ["me"] })
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
          <DialogTitle>
            Change {type === "cover" ? "Cover" : "Avatar"} Image
          </DialogTitle>
          <DialogDescription>
            Select a new {type === "cover" ? "cover" : "avatar"} image for your
            profile.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === "cover" ? "Cover" : "Avatar"} Image
                  </FormLabel>
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
                            className={cn("relative", {
                              "aspect-[5/1] min-h-52 w-full": type === "cover",
                              "size-32 overflow-hidden rounded-full border":
                                type === "avatar",
                            })}
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
