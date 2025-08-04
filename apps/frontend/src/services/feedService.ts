// src/services/feedService.ts
import axios from "axios"

import { http } from "@/utils/http"

export interface FeedPost {
  _id: string
  user: {
    _id: string
    username: string
  }
  goal: string
  milestone?: string
  message: string
  likes: string[]
  comments: {
    _id: string
    user: { _id: string; username: string }
    text: string
  }[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function handleError<T>(fn: string, error: unknown, fallback: T): T {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [feedService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [feedService::${fn}]`, error)
  }
  return fallback
}

const FeedService = {
  /** GET /feed?page=&pageSize= */
  async fetchFeed(page = 1, pageSize = 10): Promise<ApiResponse<FeedPost[]>> {
    try {
      const resp = await http.get<FeedPost[]>("/feed", {
        params: { page, pageSize },
      })
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("fetchFeed", err, {
        success: false,
        data: [],
      })
    }
  },

  /** POST /feed */
  async createPost(
    goalId: string,
    message: string,
    milestone?: string,
  ): Promise<ApiResponse<FeedPost>> {
    try {
      const resp = await http.post<FeedPost>("/feed", {
        goalId,
        message,
        milestone,
      })
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("createPost", err, { success: false })
    }
  },

  /** POST /feed/:postId/like */
  async likePost(postId: string): Promise<ApiResponse<FeedPost>> {
    try {
      const resp = await http.post<FeedPost>(`/feed/${postId}/like`)
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("likePost", err, { success: false })
    }
  },

  /** POST /feed/:postId/comment */
  async addComment(
    postId: string,
    text: string,
  ): Promise<ApiResponse<FeedPost>> {
    try {
      const resp = await http.post<FeedPost>(`/feed/${postId}/comment`, {
        text,
      })
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("addComment", err, { success: false })
    }
  },

  /** DELETE /feed/:postId/comment/:commentId */
  async removeComment(
    postId: string,
    commentId: string,
  ): Promise<ApiResponse<FeedPost>> {
    try {
      const resp = await http.delete<FeedPost>(
        `/feed/${postId}/comment/${commentId}`,
      )
      return { success: true, data: resp.data }
    } catch (err) {
      return handleError("removeComment", err, { success: false })
    }
  },
}

export default FeedService
