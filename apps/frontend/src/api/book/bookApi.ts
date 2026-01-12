import type { Envelope } from "@/types"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

/**
 * Book data model
 */
export interface Book {
  _id: string
  title: string
  author: string
  category: string
  description: string
  coverImage?: string
  addedBy?: {
    _id: string
    username: string
  }
  likes?: string[]
  likeCount?: number
  commentCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateBookInput {
  title: string
  author: string
  category: string
  description: string
  coverImage?: string
}

/**
 * Fetch all books
 */
export async function fetchBooks(): Promise<Book[]> {
  try {
    const res = await http.get<Envelope<{ books: Book[] }>>("/books")
    return res.data.data.books
  } catch (err) {
    console.error("❌ [bookApi::fetchBooks]", err)
    return []
  }
}

/**
 * Fetch a single book by ID
 */
export async function fetchBookById(id: string): Promise<Book | null> {
  try {
    const res = await http.get<Envelope<{ book: Book }>>(`/books/${id}`)
    return res.data.data.book
  } catch (err) {
    console.error("❌ [bookApi::fetchBookById]", err)
    return null
  }
}

/**
 * Create a new book (admin only)
 */
export async function createBook(data: CreateBookInput): Promise<Book> {
  try {
    const res = await http.post<Envelope<{ book: Book }>>("/books", data)
    return res.data.data.book
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Update a book (admin only)
 */
export async function updateBook(id: string, data: Partial<CreateBookInput>): Promise<Book> {
  try {
    const res = await http.put<Envelope<{ book: Book }>>(`/books/${id}`, data)
    return res.data.data.book
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Delete a book (admin only)
 */
export async function deleteBook(id: string): Promise<void> {
  try {
    await http.delete(`/books/${id}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Like a book
 */
export async function likeBook(id: string): Promise<void> {
  try {
    await http.post(`/books/${id}/like`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Unlike a book
 */
export async function unlikeBook(id: string): Promise<void> {
  try {
    await http.post(`/books/${id}/unlike`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
/**
 * Book comment model
 */
export interface BookComment {
  _id: string
  user: {
    _id: string
    username: string
    profileImage?: string
  }
  text: string
  createdAt: string
}

/**
 * Extended Book with populated comments
 */
export interface BookWithComments extends Book {
  comments?: BookComment[]
}

/**
 * Add a comment to a book
 */
export async function addBookComment(bookId: string, text: string): Promise<BookWithComments> {
  try {
    const res = await http.post<Envelope<{ book: BookWithComments }>>(`/books/${bookId}/comment`, { text })
    return res.data.data.book
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Remove a comment from a book
 */
export async function removeBookComment(bookId: string, commentId: string): Promise<void> {
  try {
    await http.delete(`/books/${bookId}/comment/${commentId}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

