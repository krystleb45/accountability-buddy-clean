"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, BookOpen, Loader2, ThumbsUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { fetchBooks } from "@/api/book/bookApi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function BooksListClient() {
  const { data: books, isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  return (
    <div className="space-y-6">
      <Button variant="link" asChild className="!px-0">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Book Recommendations
        </h1>
        <p className="text-muted-foreground mt-2">
          Curated reads to help you on your journey to success
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !books?.length ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No book recommendations yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book._id} href={`/books/${book._id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                {book.coverImage && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  <CardDescription>by {book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="mb-3">
                    {book.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {book.description}
                  </p>
                  {book.likeCount !== undefined && book.likeCount > 0 && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{book.likeCount} likes</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}