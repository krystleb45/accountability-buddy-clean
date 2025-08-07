// src/services/searchService.ts
import { http } from "@/lib/http"

export type SearchType = "user" | "group" | "goal" | "post" | "task"

export interface SearchResult {
  id: string
  type: SearchType
  title: string
  description?: string
  url: string
}

export interface Pagination {
  totalCount: number
  currentPage: number
  totalPages: number
}

const SearchService = {
  /**
   * GET /search?query=...&type=...&page=...&limit=...
   */
  async search(
    query: string,
    type: SearchType,
    page = 1,
    limit = 10,
  ): Promise<{ results: SearchResult[]; pagination: Pagination }> {
    if (!query.trim()) {
      return {
        results: [],
        pagination: { totalCount: 0, currentPage: 1, totalPages: 0 },
      }
    }

    try {
      const resp = await http.get<{
        success: boolean
        results: SearchResult[]
        pagination: Pagination
      }>("/search", {
        params: { query, type, page, limit },
      })

      return { results: resp.data.results, pagination: resp.data.pagination! }
    } catch (err: unknown) {
      console.error("[SearchService.search] failed:", err)
      throw new Error("Failed to perform search.")
    }
  },
}

export default SearchService
