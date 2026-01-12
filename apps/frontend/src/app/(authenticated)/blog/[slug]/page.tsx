"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import { ArrowLeft, Calendar, Heart, Loader2, MessageSquare, SendIcon, Tag, Trash2, User, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { BlogComment, BlogPostWithComments } from "@/api/blog/blog-api"

import { addBlogComment, fetchPostBySlug, likeBlogPost, removeBlogComment, unlikeBlogPost } from "@/api/blog/blog-api"
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

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPostBySlug(slug) as Promise<BlogPostWithComments>,
    enabled: !!slug,
  })

  const isLiked = post?.likes?.includes(user?.id || "") || false

  const { mutate: toggleLike, isPending: isLiking } = useMutation({
    mutationFn: () => (isLiked ? unlikeBlogPost(post!._id) : likeBlogPost(post!._id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] })
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
    mutationFn: (data: CommentFormData) => addBlogComment(post!._id, data.text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] })
      form.reset()
      toast.success("Comment added!")
    },
    onError: (error) => {
      toast.error("Failed to add comment", { description: error.message })
    },
  })

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: string) => removeBlogComment(post!._id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-post", slug] })
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

  if (error || !post) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Post Not Found</h1>
        <p className="text-muted-foreground">
          This blog post doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    )
  }

  const comments = (post.comments || []) as BlogComment[]

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Button variant="link" asChild className="!px-0">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      {post.coverImage && (
        <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-96">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <header>
        <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{post.author.username}</span>
            </div>
          )}
          {post.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
            </div>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-invert max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          paragraph.trim() && <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Like Button */}
      <div className="flex items-center gap-4 border-t pt-6">
        <Button
          variant={isLiked ? "default" : "outline"}
          onClick={() => toggleLike()}
          disabled={isLiking}
        >
          <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Liked" : "Like"}
          {post.likeCount !== undefined && post.likeCount > 0 && (
            <span className="ml-1">({post.likeCount})</span>
          )}
        </Button>
      </div>

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
    </article>
  )
}