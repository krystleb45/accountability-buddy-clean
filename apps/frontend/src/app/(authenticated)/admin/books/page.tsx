import type { Metadata } from "next"

import BooksAdminClient from "./client"

export const metadata: Metadata = {
  title: "Manage Books | Admin",
  description: "Create and manage book recommendations",
}

export default function BooksAdminPage() {
  return <BooksAdminClient />
}