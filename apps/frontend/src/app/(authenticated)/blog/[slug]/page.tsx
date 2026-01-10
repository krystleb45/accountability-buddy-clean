"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Loader2, Tag, User, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

import { fetchPostBySlug } from "@/api/blog/blog-api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPostBySlug(slug),
    enabled: !!slug,
  })

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

  return (
    <article className="mx-auto max-w-3xl">
      <Button variant="link" asChild className="mb-6 !px-0">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      {post.coverImage && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <header className="mb-8">
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
    </article>
  )
}