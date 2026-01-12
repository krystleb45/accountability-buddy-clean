import type { Envelope } from "@/types"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface BlogPost {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  coverImage?: string
  author: {
    _id: string
    username: string
    profileImage?: string
  }
  status: "draft" | "published"
  tags: string[]
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBlogInput {
  title: string
  content: string
  excerpt: string
  coverImage?: string
  status: "draft" | "published"
  tags: string[]
  slug?: string
}

// Public routes
export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  try {
    const resp = await http.get<Envelope<{ posts: BlogPost[] }>>("/blog")
    return resp.data.data.posts
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost> {
  try {
    const resp = await http.get<Envelope<{ post: BlogPost }>>(`/blog/${slug}`)
    return resp.data.data.post
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

// Admin routes
export async function fetchAllPosts(): Promise<BlogPost[]> {
  try {
    const resp = await http.get<Envelope<{ posts: BlogPost[] }>>("/blog/admin/all")
    return resp.data.data.posts
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchPostById(id: string): Promise<BlogPost> {
  try {
    const resp = await http.get<Envelope<{ post: BlogPost }>>(`/blog/admin/${id}`)
    return resp.data.data.post
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function createPost(data: CreateBlogInput): Promise<BlogPost> {
  try {
    const resp = await http.post<Envelope<{ post: BlogPost }>>("/blog/admin", data)
    return resp.data.data.post
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function updatePost(id: string, data: Partial<CreateBlogInput>): Promise<BlogPost> {
  try {
    const resp = await http.put<Envelope<{ post: BlogPost }>>(`/blog/admin/${id}`, data)
    return resp.data.data.post
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await http.delete(`/blog/admin/${id}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function uploadPostCover(id: string, file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("cover", file)
    const resp = await http.post<Envelope<{ coverUrl: string }>>(
      `/blog/admin/${id}/cover`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return resp.data.data.coverUrl
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Blog comment model
 */
export interface BlogComment {
  _id: string
  user: {
    _id: string
    username: string
    profileImage?: string
  }
  text: string
  createdAt: string
}

/**
 * Extended BlogPost with likes and comments
 */
export interface BlogPostWithComments extends BlogPost {
  likes?: string[]
  likeCount?: number
  comments?: BlogComment[]
  commentCount?: number
}

/**
 * Like a blog post
 */
export async function likeBlogPost(id: string): Promise<void> {
  try {
    await http.post(`/blog/like/${id}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Unlike a blog post
 */
export async function unlikeBlogPost(id: string): Promise<void> {
  try {
    await http.post(`/blog/unlike/${id}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Add a comment to a blog post
 */
export async function addBlogComment(id: string, text: string): Promise<BlogPostWithComments> {
  try {
    const res = await http.post<Envelope<{ post: BlogPostWithComments }>>(`/blog/comment/${id}`, { text })
    return res.data.data.post
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/**
 * Remove a comment from a blog post
 */
export async function removeBlogComment(postId: string, commentId: string): Promise<void> {
  try {
    await http.delete(`/blog/comment/${postId}/${commentId}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}