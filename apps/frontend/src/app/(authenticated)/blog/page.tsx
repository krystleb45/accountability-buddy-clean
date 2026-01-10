import type { Metadata } from "next"

import BlogListClient from "./client"

export const metadata: Metadata = {
  title: "Blog | Accountability Buddy",
  description: "Read our latest articles on goal setting, productivity, and personal growth.",
}

export default function BlogPage() {
  return <BlogListClient />
}