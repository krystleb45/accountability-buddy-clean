// src/recommendations/recommendationApi.ts

import axios from "axios"

import type {
  BlogPost,
  Book,
  FriendSuggestion,
  Goal,
} from "@/services/recommendationService"

import { http } from "@/lib/http"

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [recommendationApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [recommendationApi::${fn}]`, error)
  }
}

/** Fetch book recommendations */
export async function fetchBookRecommendations(): Promise<Book[]> {
  try {
    const resp = await http.get<Book[]>("/recommendations/books")
    return resp.data
  } catch (err) {
    logError("fetchBookRecommendations", err)
    return []
  }
}

/** Fetch goal recommendations */
export async function fetchGoalRecommendations(): Promise<Goal[]> {
  try {
    const resp = await http.get<Goal[]>("/recommendations/goals")
    return resp.data
  } catch (err) {
    logError("fetchGoalRecommendations", err)
    return []
  }
}

/** Fetch blog post recommendations */
export async function fetchBlogRecommendations(): Promise<BlogPost[]> {
  try {
    const resp = await http.get<BlogPost[]>("/recommendations/blogs")
    return resp.data
  } catch (err) {
    logError("fetchBlogRecommendations", err)
    return []
  }
}

/** Fetch friend suggestions */
export async function fetchFriendRecommendations(): Promise<
  FriendSuggestion[]
> {
  try {
    const resp = await http.get<FriendSuggestion[]>("/recommendations/friends")
    return resp.data
  } catch (err) {
    logError("fetchFriendRecommendations", err)
    return []
  }
}

export default {
  fetchBookRecommendations,
  fetchGoalRecommendations,
  fetchBlogRecommendations,
  fetchFriendRecommendations,
}
