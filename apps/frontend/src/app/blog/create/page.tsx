// src/app/blog/create/page.tsx
import type { Metadata } from "next"
import type { ReactNode } from "react"

import { getServerSession } from "next-auth/next"
import dynamic from "next/dynamic"
import { redirect } from "next/navigation"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export const metadata: Metadata = {
  title: "Create New Blog Post • Accountability Buddy",
  description: "Admin interface for creating a new blog post.",
}

// dynamically load the form UI
const CreateBlogClient = dynamic(() => import("./page.client"))

export default async function CreateBlogPageWrapper(): Promise<ReactNode> {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }
  return <CreateBlogClient />
}
