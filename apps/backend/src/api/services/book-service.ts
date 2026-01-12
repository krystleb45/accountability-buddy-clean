import mongoose from "mongoose"

import { Book } from "../models/Book.js"

export async function addBookService(
  userId: string,
  data: {
    title: string
    author: string
    category: string
    description: string
    coverImage?: string
  },
) {
  const book = new Book({
    ...data,
    addedBy: new mongoose.Types.ObjectId(userId),
    likes: [],
    comments: [],
  })
  await book.save()
  return book
}

export async function getAllBooksService() {
  return Book.find().sort({ createdAt: -1 })
}

export async function getBookByIdService(id: string) {
  const book = await Book.findById(id).populate("comments.user", "username profileImage")
  if (!book) {
    throw new Error("Book not found")
  }
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
) {
  const book = await Book.findByIdAndUpdate(id, updates, { new: true })
  if (!book) {
    throw new Error("Book not found")
  }
  return book
}

export async function deleteBookService(id: string): Promise<void> {
  const res = await Book.findByIdAndDelete(id)
  if (!res) {
    throw new Error("Book not found")
  }
}

export async function likeBookService(userId: string, bookId: string) {
  const book = await Book.findById(bookId)
  if (!book) {
    throw new Error("Book not found")
  }

  const uid = new mongoose.Types.ObjectId(userId)
  await book.addLike(uid)
  return book
}

export async function unlikeBookService(userId: string, bookId: string) {
  const book = await Book.findById(bookId)
  if (!book) {
    throw new Error("Book not found")
  }

  const uid = new mongoose.Types.ObjectId(userId)
  await book.removeLike(uid)
  return book
}

export async function addBookCommentService(
  userId: string,
  bookId: string,
  text: string,
) {
  const book = await Book.findById(bookId)
  if (!book) {
    throw new Error("Book not found")
  }

  const uid = new mongoose.Types.ObjectId(userId)
  await book.addComment(uid, text)
  return book
}

export async function removeBookCommentService(
  bookId: string,
  commentId: string,
) {
  const book = await Book.findById(bookId)
  if (!book) {
    throw new Error("Book not found")
  }

  const success = await book.removeComment(
    new mongoose.Types.ObjectId(commentId),
  )

  if (!success) {
    throw new Error("Comment not found")
  }

  return book
}