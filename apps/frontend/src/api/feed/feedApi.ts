// src/feed/feedApi.ts

import axios from "axios"

import { http } from "@/lib/http"

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

export interface FeedComment {
  _id: string
  user: { _id: string; username: string }
  text: string
}

/**
 * Fetch paginated feed posts
 * GET /feed?page=&pageSize=
 */
export async function fetchFeedPosts(
  page = 1,
  pageSize = 10,
): Promise<FeedPost[]> {
  try {
    const resp = await http.get<FeedPost[]>("/feed", {
      params: { page, pageSize },
    })
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [feedApi::fetchFeedPosts]",
        error.response?.data || error.message,
      )
    } else {
      console.error("❌ [feedApi::fetchFeedPosts]", error)
    }
    return []
  }
}

/**
 * Create a new feed post
 * POST /feed
 */
export async function createFeedPost(payload: {
  goalId: string
  message: string
  milestone?: string
}): Promise<FeedPost | null> {
  try {
    const resp = await http.post<FeedPost>("/feed", payload)
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [feedApi::createFeedPost]",
        error.response?.data || error.message,
      )
    } else {
      console.error("❌ [feedApi::createFeedPost]", error)
    }
    return null
  }
}

/**
 * Like a feed post
 * POST /feed/:postId/like
 */
export async function likeFeedPost(postId: string): Promise<FeedPost | null> {
  if (!postId) {
    console.error("❌ [feedApi::likeFeedPost] postId is required")
    return null
  }
  try {
    const resp = await http.post<FeedPost>(
      `/feed/${encodeURIComponent(postId)}/like`,
    )
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [feedApi::likeFeedPost]",
        error.response?.data || error.message,
      )
    } else {
      console.error("❌ [feedApi::likeFeedPost]", error)
    }
    return null
  }
}

/**
 * Add a comment to a feed post
 * POST /feed/:postId/comment
 */
export async function commentOnFeedPost(
  postId: string,
  text: string,
): Promise<FeedPost | null> {
  if (!postId || !text.trim()) {
    console.error(
      "❌ [feedApi::commentOnFeedPost] postId and text are required",
    )
    return null
  }
  try {
    const resp = await http.post<FeedPost>(
      `/feed/${encodeURIComponent(postId)}/comment`,
      { text },
    )
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [feedApi::commentOnFeedPost]",
        error.response?.data || error.message,
      )
    } else {
      console.error("❌ [feedApi::commentOnFeedPost]", error)
    }
    return null
  }
}

/**
 * Remove a comment from a post
 * DELETE /feed/:postId/comment/:commentId
 */
export async function removeFeedComment(
  postId: string,
  commentId: string,
): Promise<FeedPost | null> {
  if (!postId || !commentId) {
    console.error(
      "❌ [feedApi::removeFeedComment] postId and commentId are required",
    )
    return null
  }
  try {
    const resp = await http.delete<FeedPost>(
      `/feed/${encodeURIComponent(postId)}/comment/${encodeURIComponent(commentId)}`,
    )
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ [feedApi::removeFeedComment]",
        error.response?.data || error.message,
      )
    } else {
      console.error("❌ [feedApi::removeFeedComment]", error)
    }
    return null
  }
}

export default {
  fetchFeedPosts,
  createFeedPost,
  likeFeedPost,
  commentOnFeedPost,
  removeFeedComment,
}
