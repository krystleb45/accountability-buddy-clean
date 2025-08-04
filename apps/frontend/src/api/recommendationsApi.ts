// src/recommendationsApi.ts
// -----------------------------------------------------------------------------
// Shared HTTP client + clean endpoints
// -----------------------------------------------------------------------------
import axios from "axios" // for axios.isAxiosError type guard

import { http } from "@/utils/http" // centralized Axios instance

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
export interface RecommendedFriend {
  id: string
  name: string
}
export interface RecommendedGoal {
  id: string
  title: string
}
export interface RecommendedBook {
  id: string
  title: string
  author: string
}
export interface BlogPost {
  id: string
  title: string
  snippet: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface ApiError {
  message: string
}

function handleErr(scope: string, err: unknown): void {
  if (axios.isAxiosError<ApiError>(err) && err.response) {
    console.error(`[recommendationsApi] ${scope}:`, err.response.data.message)
  } else {
    console.error(`[recommendationsApi] ${scope}:`, err)
  }
}

// -----------------------------------------------------------------------------
// API Functions (all paths are relative to NEXT_PUBLIC_API_URL)
// -----------------------------------------------------------------------------

/** AI-powered friend recommendations. */
export async function getRecommendedFriends(): Promise<RecommendedFriend[]> {
  try {
    const resp = await http.get<ApiResponse<RecommendedFriend[]>>(
      "/recommendations/friends",
    )
    return resp.data.data
  } catch (err) {
    handleErr("getRecommendedFriends", err)
    return []
  }
}

/** AI-powered goal recommendations. */
export async function getRecommendedGoals(): Promise<RecommendedGoal[]> {
  try {
    const resp = await http.get<ApiResponse<RecommendedGoal[]>>(
      "/recommendations/goals",
    )
    return resp.data.data
  } catch (err) {
    handleErr("getRecommendedGoals", err)
    return []
  }
}

/** AI-powered book recommendations. */
export async function getRecommendedBooks(): Promise<RecommendedBook[]> {
  try {
    const resp = await http.get<ApiResponse<RecommendedBook[]>>(
      "/recommendations/books",
    )
    return resp.data.data
  } catch (err) {
    handleErr("getRecommendedBooks", err)
    return []
  }
}

/** Latest blog posts. */
export async function getLatestBlogs(): Promise<BlogPost[]> {
  try {
    const resp = await http.get<ApiResponse<BlogPost[]>>(
      "/recommendations/blogs",
    )
    return resp.data.data
  } catch (err) {
    handleErr("getLatestBlogs", err)
    return []
  }
}

export default {
  getRecommendedFriends,
  getRecommendedGoals,
  getRecommendedBooks,
  getLatestBlogs,
}
