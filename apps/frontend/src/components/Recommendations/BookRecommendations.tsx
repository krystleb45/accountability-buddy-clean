// components/Recommendations/BookRecommendations.tsx
"use client"

import React, { useEffect, useState } from "react"

import styles from "./Recommendations.module.css"

interface BookRecommendation {
  id: string
  title: string
  author: string
  description: string
  link?: string
}

interface BookRecommendationsProps {
  recommendations?: BookRecommendation[]
}

const BookRecommendations: React.FC<BookRecommendationsProps> = ({
  recommendations,
}) => {
  const [books, setBooks] = useState<BookRecommendation[]>([])
  const [loading, setLoading] = useState<boolean>(!recommendations)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (recommendations) {
      setBooks(recommendations)
      setLoading(false)
      return
    }

    const fetchBookRecommendations = async (): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/book-recommendations")
        if (!res.ok) throw new Error("Failed to fetch book recommendations")
        const data: BookRecommendation[] = await res.json()
        setBooks(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error fetching recommendations",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBookRecommendations()
  }, [recommendations])

  if (loading) {
    return <p className={styles.status}>Loading book recommendations…</p>
  }

  if (error) {
    return (
      <p className={styles.status} role="alert">
        {error}
      </p>
    )
  }

  return (
    <section className={styles.container} aria-labelledby="book-recs-heading">
      <h2 id="book-recs-heading" className={styles.heading}>
        Book Recommendations
      </h2>

      {books.length > 0 ? (
        <ul className={styles.list}>
          {books.map((book) => (
            <li key={book.id} className={styles.item}>
              <article className={styles.card}>
                <h3 className={styles.title}>{book.title}</h3>
                <p className={styles.author}>
                  <strong>Author:</strong> {book.author}
                </p>
                <p className={styles.description}>{book.description}</p>
                {book.link && (
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Learn more
                  </a>
                )}
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          No book recommendations available at the moment.
        </p>
      )}
    </section>
  )
}

export default BookRecommendations
