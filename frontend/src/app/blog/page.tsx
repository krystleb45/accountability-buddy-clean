// src/app/blog/page.tsx
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '@/app/api/auth/[...nextauth]/route'
import { redirect }         from 'next/navigation'
import Link                 from 'next/link'
import type { Metadata }    from 'next'

export const metadata: Metadata = {
  title:       'Blog • Accountability Buddy',
  description: 'Read our latest articles on productivity, fitness, self-improvement and more.',
  openGraph: {
    title:       'Blog • Accountability Buddy',
    description: 'Read our latest articles on productivity, fitness, self-improvement and more.',
    url:         'https://your-domain.com/blog',
    siteName:    'Accountability Buddy',
    type:        'website',
  },
}

interface RawBlogPost {
  _id:       string
  title:     string
  category:  string
  summary:   string
  imageUrl?: string
  createdAt: string
}

interface BlogPost {
  id:        string
  title:     string
  category:  string
  summary:   string
  imageUrl:  string   // now always a string (we’ll default to '')
  createdAt: string
}

export default async function BlogPage() {
  // 1) Require login
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    redirect('/login')
  }

  // 2) Fetch via your Express backend
  const backend = (process.env.BACKEND_URL || 'http://localhost:5050').replace(/\/$/, '')
  const resp = await fetch(`${backend}/api/blog`, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
    cache:   'no-store',
  })
  if (!resp.ok) {
    console.error('Blog fetch error:', await resp.text())
    throw new Error('Failed to load blog posts')
  }

  const payload = await resp.json() as {
    success:   boolean
    message:   string
    data:      { posts: RawBlogPost[] }
    timestamp: string
  }

  // 3) Unwrap the actual array at payload.data.posts
  if (!payload.success || !Array.isArray(payload.data.posts)) {
    console.error('Unexpected blog payload', payload)
    throw new Error('Invalid blog data')
  }

  const blogs: BlogPost[] = payload.data.posts.map(post => ({
    id:        post._id,
    title:     post.title,
    category:  post.category,
    summary:   post.summary,
    imageUrl:  post.imageUrl ?? '',   // ensure string
    createdAt: post.createdAt,
  }))

  // 4) Render
  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <h1 className="mb-6 text-center text-3xl font-bold text-green-400">📚 Blog</h1>

      {/* ← Back to Dashboard ABOVE everything */}
      <div className="mb-6 text-center">
        <Link href="/dashboard" className="text-lg text-green-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Grid of posts if any */}
      {blogs.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {blogs.map(post => (
            <div key={post.id} className="rounded-lg bg-gray-900 p-4 shadow-lg hover:shadow-xl">
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="mb-3 h-40 w-full rounded-lg object-cover"
                />
              )}
              <h2 className="text-xl font-bold text-green-300">{post.title}</h2>
              <p className="mb-2 text-sm text-gray-400">
                {post.category} • {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="mb-3 text-gray-300">{post.summary}</p>
              <Link href={`/blog/${post.id}`} className="text-green-400 hover:underline">
                Read More →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* “No posts” message at the bottom, only if there are none */}
      {blogs.length === 0 && (
        <p className="w-full text-center text-gray-400">No blog posts found.</p>
      )}
    </div>
  )
}
