"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, BookOpen, Heart, Loader2, MessageSquare, SendIcon, Trash2, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { BookComment, BookWithComments } from "@/api/book/bookApi"

import { addBookComment, fetchBookById, likeBook, removeBookComment, unlikeBook } from "@/api/book/bookApi"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth/auth-context"

const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty").max(500, "Comment is too long"),
})

type CommentFormData = z.infer<typeof commentSchema>

export default function BookDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: book, isLoading, error } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBookById(id) as Promise<BookWithComments | null>,
    enabled: !!id,
  })

  const isLiked = book?.likes?.includes(user?.id || "") || false

  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: () => (isLiked ? unlikeBook(id) : likeBook(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", id] })
      queryClient.invalidateQueries({ queryKey: ["books"] })
      toast.success(isLiked ? "Removed from favorites" : "Added to favorites!")
    },
    onError: (error) => {
      toast.error("Action failed", { description: error.message })
    },
  })

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: "" },
  })

  const { mutate: submitComment, isPending: isSubmitting } = useMutation({
    mutationFn: (data: CommentFormData) => addBookComment(id, data.text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", id] })
      form.reset()
      toast.success("Comment added!")
    },
    onError: (error) => {
      toast.error("Failed to add comment", { description: error.message })
    },
  })

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: string) => removeBookComment(id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book", id] })
      toast.success("Comment deleted")
    },
    onError: (error) => {
      toast.error("Failed to delete comment", { description: error.message })
    },
  })

  const onSubmit = (data: CommentFormData) => {
    submitComment(data)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Book Not Found</h1>
        <p className="text-muted-foreground">
          This book doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>
      </div>
    )
  }

  const comments = (book.comments || []) as BookComment[]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="link" asChild className="!px-0">
        <Link href="/books">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {book.coverImage ? (
              <div className="relative h-64 w-44 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-64 w-44 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{book.title}</h1>
                <p className="text-lg text-muted-foreground">by {book.author}</p>
              </div>

              <Badge variant="secondary" className="text-sm">
                {book.category}
              </Badge>

              <p className="text-muted-foreground">{book.description}</p>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  onClick={() => toggleLike()}
                  disabled={isLiking}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "Liked" : "Like"}
                  {book.likeCount !== undefined && book.likeCount > 0 && (
                    <span className="ml-1">({book.likeCount})</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Write a comment..."
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </Button>
            </form>
          </Form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                  <UserAvatar
                    userId={comment.user._id}
                    src={comment.user.profileImage}
                    alt={comment.user.username}
                    className="h-8 w-8"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">@{comment.user.username}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        {comment.user._id === user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteComment(comment._id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}