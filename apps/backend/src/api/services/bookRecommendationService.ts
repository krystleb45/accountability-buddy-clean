// src/api/services/bookService.ts
import mongoose from "mongoose"

import type { IBook } from "../models/Book"

import Book from "../models/Book"

export async function addBookService(
  userId: string,
  data: {
    title: string
    author: string
    category: string
    description: string
    coverImage?: string
  },
): Promise<IBook> {
  const book = new Book({
    ...data,
    addedBy: new mongoose.Types.ObjectId(userId),
    likes: [],
    comments: [],
  })
  await book.save()
  return book
}

export async function getAllBooksService(): Promise<IBook[]> {
  return Book.find().sort({ createdAt: -1 })
}

export async function getBookByIdService(id: string): Promise<IBook> {
  const book = await Book.findById(id)
  if (!book) throw new Error("Book not found")
  return book
}

export async function updateBookService(
  id: string,
  updates: Partial<{
    title: string
    author: string
    category: string
    description: string
    coverImage?: string
  }>,
): Promise<IBook> {
  const book = await Book.findByIdAndUpdate(id, updates, { new: true })
  if (!book) throw new Error("Book not found")
  return book
}

export async function deleteBookService(id: string): Promise<void> {
  const res = await Book.findByIdAndDelete(id)
  if (!res) throw new Error("Book not found")
}

export async function likeBookService(
  userId: string,
  bookId: string,
): Promise<IBook> {
  const book = await Book.findById(bookId)
  if (!book) throw new Error("Book not found")

  const uid = new mongoose.Types.ObjectId(userId)
  if (book.likes.some((l) => l.equals(uid))) {
    throw new Error("Already liked")
  }
  book.likes.push(uid)
  await book.save()
  return book
}

export async function unlikeBookService(
  userId: string,
  bookId: string,
): Promise<IBook> {
  const book = await Book.findById(bookId)
  if (!book) throw new Error("Book not found")

  book.likes = book.likes.filter((l) => l.toString() !== userId)
  await book.save()
  return book
}

export async function addBookCommentService(
  userId: string,
  bookId: string,
  text: string,
): Promise<IBook> {
  const book = await Book.findById(bookId)
  if (!book) throw new Error("Book not found")

  const comment = book.comments.create({
    user: new mongoose.Types.ObjectId(userId),
    text,
    createdAt: new Date(),
  })
  book.comments.push(comment as any)
  await book.save()
  return book
}

export async function removeBookCommentService(
  userId: string,
  bookId: string,
  commentId: string,
): Promise<IBook> {
  const book = await Book.findById(bookId)
  if (!book) throw new Error("Book not found")

  const idx = book.comments.findIndex((c) => c._id.toString() === commentId)
  if (idx === -1) throw new Error("Comment not found")
  if (book.comments[idx].user.toString() !== userId) {
    throw new Error("Unauthorized")
  }

  book.comments.splice(idx, 1)
  await book.save()
  return book
}
export default {
  addBookService,
  getAllBooksService,
  getBookByIdService,
  updateBookService,
  deleteBookService,
  likeBookService,
  unlikeBookService,
  addBookCommentService,
  removeBookCommentService,
}
