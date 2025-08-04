// src/app/blog/create/page.client.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

const categories = [
  "Productivity",
  "Fitness",
  "Self-Improvement",
  "Business",
  "Tech",
]

export default function CreateBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState(categories[0])
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          content,
          imageUrl,
          author: "Admin",
        }),
      })
      if (!res.ok) throw new Error("Failed to create blog post")
      router.push("/blog")
    } catch {
      setError("Error creating blog post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold text-green-400">
        Create Blog Post
      </h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-2 block text-gray-400">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-black p-3 text-white"
            required
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="mb-2 block text-gray-400">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-black p-3 text-white"
            disabled={loading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Image URL */}
        <div>
          <label htmlFor="imageUrl" className="mb-2 block text-gray-400">
            Featured Image URL
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-black p-3 text-white"
            disabled={loading}
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="mb-2 block text-gray-400">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-40 w-full rounded-lg border border-gray-600 bg-black p-3 text-white"
            required
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Blog Post"}
        </button>
      </form>

      {/* Back to Blog List */}
      <div className="mt-6 text-center">
        <Link href="/blog" className="text-green-400 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </div>
  )
}
