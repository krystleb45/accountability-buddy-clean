import type { Metadata } from "next"

import BlogAdminClient from "./client"

export const metadata: Metadata = {
  title: "Manage Blog | Admin",
  description: "Create and manage blog posts",
}

export default function BlogAdminPage() {
  return <BlogAdminClient />
}