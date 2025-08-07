// src/services/blogService.ts
import axios from "axios"

import { http } from "@/lib/http"

// -----------------------------------------------------------------------------
// Types & Interfaces
// -----------------------------------------------------------------------------
export interface BlogPost {
  id: string
  title: string
  content: string
  category: string
  authorId: string
  createdAt: string
  updatedAt?: string
  likesCount?: number
  commentsCount?: number
  [key: string]: unknown
}

export interface Comment {
  id: string
  postId: string
  userId: string
  text: string
  createdAt: string
}

interface PaginatedPosts {
  posts: BlogPost[]
  total: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// -----------------------------------------------------------------------------
// Centralized error handler
// -----------------------------------------------------------------------------
function handleApiError<T>(fn: string, error: unknown, fallback: T): T {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [blogService::${fn}]`,
      error.response?.data ?? error.message,
    )
  } else {
    console.error(`❌ [blogService::${fn}]`, error)
  }
  return fallback
}

// -----------------------------------------------------------------------------
// Service methods under `/blog`
// -----------------------------------------------------------------------------
const BlogService = {
  /**
   * Fetch a paginated list of posts
   */
  async listPosts(page = 1, limit = 10): Promise<ApiResponse<PaginatedPosts>> {
    try {
      const res = await http.get<PaginatedPosts>("/blog", {
        params: { page, limit },
      })
      return { success: true, data: res.data }
    } catch (err) {
      return handleApiError("listPosts", err, {
        success: false,
        data: { posts: [], total: 0 },
      })
    }
  },

  /**
   * Fetch a single post by ID
   */
  async getPost(id: string): Promise<ApiResponse<BlogPost>> {
    if (!id) return { success: false, message: "Post ID is required" }
    try {
      const res = await http.get<BlogPost>(`/blog/${id}`)
      return { success: true, data: res.data }
    } catch (err) {
      return handleApiError("getPost", err, { success: false })
    }
  },

  /**
   * Create a new blog post
   */
  async createPost(payload: {
    title: string
    content: string
    category: string
  }): Promise<ApiResponse<BlogPost>> {
    try {
      const res = await http.post<BlogPost>("/blog", payload)
      return { success: true, data: res.data }
    } catch (err) {
      return handleApiError("createPost", err, { success: false })
    }
  },

  /**
   * Update an existing post
   */
  async updatePost(
    id: string,
    payload: Partial<{ title: string; content: string; category: string }>,
  ): Promise<ApiResponse<BlogPost>> {
    if (!id) return { success: false, message: "Post ID is required" }
    try {
      const res = await http.put<BlogPost>(`/blog/${id}`, payload)
      return { success: true, data: res.data }
    } catch (err) {
      return handleApiError("updatePost", err, { success: false })
    }
  },

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<ApiResponse<null>> {
    if (!id) return { success: false, message: "Post ID is required" }
    try {
      await http.delete(`/blog/${id}`)
      return { success: true }
    } catch (err) {
      return handleApiError("deletePost", err, { success: false })
    }
  },

  /**
   * Toggle like/unlike a post
   */
  async toggleLike(id: string): Promise<ApiResponse<{ likesCount: number }>> {
    if (!id) return { success: false, message: "Post ID is required" }
    try {
      const res = await http.post<{ likesCount: number }>(`/blog/${id}/like`)
      return { success: true, data: res.data }
    } catch (err) {
      return handleApiError("toggleLike", err, { success: false })
    }
  },

  /**
   * Add a comment to a post
   */
  async addComment(id: string, text: string): Promise<ApiResponse<Comment>> {
    if (!id || !text)
      return { success: false, message: "Post ID and text are required" }
    try {
      const res = await http.post<Comment>(`/blog/${id}/comment`, { text })
      return { success: true, data: res.data }
    } catch (err) {
      return handleApiError("addComment", err, { success: false })
    }
  },

  /**
   * Delete a comment from a post
   */
  async deleteComment(
    id: string,
    commentId: string,
  ): Promise<ApiResponse<null>> {
    if (!id || !commentId)
      return { success: false, message: "Post ID and comment ID are required" }
    try {
      await http.delete(`/blog/${id}/comment/${commentId}`)
      return { success: true }
    } catch (err) {
      return handleApiError("deleteComment", err, { success: false })
    }
  },
}

export default BlogService
