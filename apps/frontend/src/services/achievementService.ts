// src/services/achievementService.ts
import { AxiosHeaders } from "axios"

import { http } from "@/lib/http"

import { getAuthHeader } from "./authService"

export interface Achievement {
  id: string
  name: string
  description: string
  requirements: number
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Attach auth header
http.interceptors.request.use(
  (config) => {
    // pull out just the Authorization value (if any)
    const { Authorization } = getAuthHeader()
    if (Authorization) {
      // normalize existing headers into an AxiosHeaders instance, then set our token
      config.headers = AxiosHeaders.from(config.headers).set(
        "Authorization",
        Authorization,
      )
    }
    return config
  },
  (err) => Promise.reject(err),
)

function handleError<T>(fn: string, err: unknown, fallback: T): T {
  console.error(`[achievementService.${fn}]`, err)
  return fallback
}

const achievementService = {
  /** GET /api/achievements */
  async fetchAll(): Promise<ApiResponse<{ achievements: Achievement[] }>> {
    try {
      const res =
        await http.get<ApiResponse<{ achievements: Achievement[] }>>(
          "/achievements",
        )
      return res.data
    } catch (err) {
      return {
        success: false,
        data: { achievements: handleError("fetchAll", err, []) },
        message: "Failed to load achievements",
      }
    }
  },

  /** POST /api/achievements/add */
  async add(
    name: string,
    description: string,
    requirements: number,
  ): Promise<ApiResponse<{ achievement: Achievement }>> {
    try {
      const res = await http.post<ApiResponse<{ achievement: Achievement }>>(
        "/achievements/add",
        { name, description, requirements },
      )
      return res.data
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (err) {
      return { success: false, message: "Failed to create achievement" }
    }
  },

  /** DELETE /api/achievements/:id */
  async remove(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await http.delete<ApiResponse<null>>(`/achievements/${id}`)
      return res.data
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (err) {
      return { success: false, message: "Failed to delete achievement" }
    }
  },

  /** GET /api/achievements/leaderboard */
  async leaderboard(): Promise<ApiResponse<{ achievements: Achievement[] }>> {
    try {
      const res = await http.get<ApiResponse<{ achievements: Achievement[] }>>(
        "/achievements/leaderboard",
      )
      return res.data
    } catch (err) {
      return {
        success: false,
        data: { achievements: handleError("leaderboard", err, []) },
        message: "Failed to load leaderboard",
      }
    }
  },
}

export default achievementService
