import type { Metadata } from "next"

import BooksListClient from "./client"

export const metadata: Metadata = {
  title: "Book Recommendations | Accountability Buddy",
  description: "Discover books to help you achieve your goals and grow personally.",
}

export default function BooksPage() {
  return <BooksListClient />
}