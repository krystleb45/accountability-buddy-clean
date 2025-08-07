// src/services/recommendationService.ts
import type { AxiosError } from "axios"

import { http } from "@/lib/http"

export interface Book {
  id: string
  title: string
  author: string
  description?: string
  coverUrl?: string
  [key: string]: unknown
}

export interface Goal {
  id: string
  title: string
  description?: string
  progress?: number
  [key: string]: unknown
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  [key: string]: unknown
}

export interface FriendSuggestion {
  id: string
  username: string
  mutualFriendsCount: number
  [key: string]: unknown
}

class RecommendationService {
  /** GET /recommendations/books */
  static async getBooks(): Promise<Book[]> {
    try {
      const resp = await http.get<{ success: boolean; data: Book[] }>(
        "/recommendations/books",
      )
      return resp.data.data
    } catch (err: unknown) {
      console.error(
        "[RecommendationService.getBooks] failed:",
        (err as AxiosError).message || err,
      )
      throw new Error("Failed to fetch book recommendations.")
    }
  }

  /** GET /recommendations/goals */
  static async getGoals(): Promise<Goal[]> {
    try {
      const resp = await http.get<{ success: boolean; data: Goal[] }>(
        "/recommendations/goals",
      )
      return resp.data.data
    } catch (err: unknown) {
      console.error(
        "[RecommendationService.getGoals] failed:",
        (err as AxiosError).message || err,
      )
      throw new Error("Failed to fetch goal recommendations.")
    }
  }

  /** GET /recommendations/blogs */
  static async getBlogs(): Promise<BlogPost[]> {
    try {
      const resp = await http.get<{ success: boolean; data: BlogPost[] }>(
        "/recommendations/blogs",
      )
      return resp.data.data
    } catch (err: unknown) {
      console.error(
        "[RecommendationService.getBlogs] failed:",
        (err as AxiosError).message || err,
      )
      throw new Error("Failed to fetch blog recommendations.")
    }
  }

  /** GET /recommendations/friends */
  static async getFriends(): Promise<FriendSuggestion[]> {
    try {
      const resp = await http.get<{
        success: boolean
        data: FriendSuggestion[]
      }>("/recommendations/friends")
      return resp.data.data
    } catch (err: unknown) {
      console.error(
        "[RecommendationService.getFriends] failed:",
        (err as AxiosError).message || err,
      )
      throw new Error("Failed to fetch friend recommendations.")
    }
  }
}

export default RecommendationService
