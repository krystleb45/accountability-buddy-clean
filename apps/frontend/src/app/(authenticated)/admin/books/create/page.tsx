"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { createBook } from "@/api/book/bookApi"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().url().optional().or(z.literal("")),
})

type BookFormData = z.infer<typeof bookSchema>

export default function CreateBookPage() {
  const router = useRouter()

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      category: "",
      description: "",
      coverImage: "",
    },
  })

  const { mutate: create, isPending } = useMutation({
    mutationFn: (data: BookFormData) =>
      createBook({
        ...data,
        coverImage: data.coverImage || undefined,
      }),
    onSuccess: () => {
      toast.success("Book added!")
      router.push("/admin/books")
    },
    onError: (error) => {
      toast.error("Failed to add book", { description: error.message })
    },
  })

  return (
    <div className="space-y-6">
      <Button variant="link" asChild className="!px-0">
        <Link href="/admin/books">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </Link>
      </Button>

      <h1 className="text-3xl font-bold">Add Book Recommendation</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => create(data))} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
              <CardDescription>
                Add a book recommendation for your users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Book title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="Author name..." {...field} />
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
                      <Input
                        placeholder="e.g., Self-Help, Productivity, Mindset"
                        {...field}
                      />
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
                        placeholder="Why do you recommend this book?"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/cover.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Add Book
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}