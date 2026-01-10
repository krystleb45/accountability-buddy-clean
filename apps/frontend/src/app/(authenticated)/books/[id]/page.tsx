"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, BookOpen, Heart, Loader2, MessageSquare, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { fetchBookById, likeBook, unlikeBook } from "@/api/book/bookApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth/auth-context"

export default function BookDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: book, isLoading, error } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBookById(id),
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
            Comments ({book.commentCount || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comments coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}