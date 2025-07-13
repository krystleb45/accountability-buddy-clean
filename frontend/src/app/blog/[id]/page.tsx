// src/app/blog/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  imageUrl?: string;
  createdAt: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${params.id}`);
  if (!res.ok) {
    return { title: 'Blog post not found • Accountability Buddy' };
  }
  const blog: BlogPost = await res.json();
  const metaTitle = `${blog.title} • Accountability Buddy`;
  const metaDesc = blog.content.slice(0, 150);

  return {
    title: `${blog.title} • Blog • Accountability Buddy`,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      url: `https://your-domain.com/blog/${blog.id}`,
      type: 'article',
      ...(blog.imageUrl ? { images: [blog.imageUrl] } : {}),
    },
    twitter: {
      card: blog.imageUrl ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDesc,
      ...(blog.imageUrl ? { images: [blog.imageUrl] } : {}),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${params.id}`);
  if (!res.ok) notFound();
  const blog: BlogPost = await res.json();

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <h1 className="mb-4 text-4xl font-bold text-green-400">{blog.title}</h1>
      <p className="mb-6 text-sm text-gray-400">
        {blog.category} • Written by {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
      </p>

      {blog.imageUrl && (
        <img
          src={blog.imageUrl}
          alt={blog.title}
          className="mb-6 h-80 w-full rounded-lg object-cover"
        />
      )}

      <div className="whitespace-pre-line text-lg leading-relaxed text-gray-300">
        {blog.content}
      </div>

      <div className="mt-8">
        <Link href="/blog" className="text-green-400 hover:underline">
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
