// src/services/matchService.ts
import axios from "axios"

import { http } from "@/utils/http"

export interface Match {
  id: string
  user1: string
  user2: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  totalMatches: number
  currentPage: number
  totalPages: number
}

export interface MatchListResponse {
  matches: Match[]
  pagination: Pagination
}

function handleError<T>(fn: string, error: unknown, fallback: T): T {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [matchService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [matchService::${fn}]`, error)
  }
  return fallback
}

const MatchService = {
  /** POST /matches */
  async create(
    user1: string,
    user2: string,
    status = "pending",
  ): Promise<Match> {
    try {
      const resp = await http.post<Match>("/matches", { user1, user2, status })
      return resp.data
    } catch (err) {
      return handleError("create", err, {} as Match)
    }
  },

  /** GET /matches?page=&limit= */
  async list(page = 1, limit = 10): Promise<MatchListResponse> {
    try {
      const resp = await http.get<MatchListResponse>("/matches", {
        params: { page, limit },
      })
      return resp.data
    } catch (err) {
      return handleError("list", err, {
        matches: [],
        pagination: { totalMatches: 0, currentPage: page, totalPages: 0 },
      })
    }
  },

  /** GET /matches/:matchId */
  async getById(matchId: string): Promise<Match> {
    try {
      const resp = await http.get<Match>(
        `/matches/${encodeURIComponent(matchId)}`,
      )
      return resp.data
    } catch (err) {
      return handleError("getById", err, {} as Match)
    }
  },

  /** PATCH /matches/:matchId/status */
  async updateStatus(matchId: string, status: string): Promise<Match> {
    try {
      const resp = await http.patch<Match>(
        `/matches/${encodeURIComponent(matchId)}/status`,
        {
          status,
        },
      )
      return resp.data
    } catch (err) {
      return handleError("updateStatus", err, {} as Match)
    }
  },

  /** DELETE /matches/:matchId */
  async delete(matchId: string): Promise<boolean> {
    try {
      await http.delete(`/matches/${encodeURIComponent(matchId)}`)
      return true
    } catch (err) {
      handleError("delete", err, false)
      return false
    }
  },
}

export default MatchService
