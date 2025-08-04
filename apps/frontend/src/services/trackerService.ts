import type { AxiosResponse } from "axios"

import axios from "axios"

import { http } from "@/utils/http"

interface ApiErrorResponse {
  message: string
}

// Retry helper constrained to AxiosResponse<U>
async function axiosRetry<U>(
  fn: () => Promise<AxiosResponse<U>>,
  retries = 3,
): Promise<AxiosResponse<U>> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch (err: unknown) {
      const isServerErr =
        axios.isAxiosError<ApiErrorResponse>(err) &&
        err.response?.status !== undefined &&
        err.response.status >= 500
      if (isServerErr && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 2 ** attempt * 1000))
        attempt++
        continue
      }
      throw err
    }
  }
  throw new Error("Failed after multiple retries.")
}

export interface Tracker {
  _id: string
  user: string
  name: string
  progress: number
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface TrackingData {
  _id: string
  user: string
  [key: string]: unknown
}

const TrackerService = {
  /** GET /trackers */
  async getAllTrackers(): Promise<Tracker[]> {
    // The http interceptor will add Authorization if getAuthHeader() returns it.
    const resp = await axiosRetry(() => http.get<Tracker[]>("/trackers"))
    return resp.data
  },

  /** POST /trackers */
  async createTracker(name: string): Promise<Tracker> {
    if (!name.trim()) throw new Error("Tracker name is required")
    const resp = await axiosRetry(() =>
      http.post<Tracker>("/trackers", { name }),
    )
    return resp.data
  },

  /** PUT /trackers/:id */
  async updateTracker(id: string, progress: number): Promise<Tracker> {
    if (!id.trim()) throw new Error("Tracker ID is required")
    const resp = await axiosRetry(() =>
      http.put<Tracker>(`/trackers/${encodeURIComponent(id)}`, { progress }),
    )
    return resp.data
  },

  /** DELETE /trackers/:id */
  async deleteTracker(id: string): Promise<void> {
    if (!id.trim()) throw new Error("Tracker ID is required")
    await axiosRetry(() => http.delete(`/trackers/${encodeURIComponent(id)}`))
  },

  /** GET /trackers/data */
  async getTrackingData(): Promise<TrackingData[]> {
    const resp = await axiosRetry(() =>
      http.get<TrackingData[]>("/trackers/data"),
    )
    return resp.data
  },

  /** POST /trackers/add */
  async addTrackingData(
    payload: Record<string, unknown>,
  ): Promise<TrackingData> {
    const resp = await axiosRetry(() =>
      http.post<TrackingData>("/trackers/add", payload),
    )
    return resp.data
  },

  /** DELETE /trackers/delete/:id */
  async deleteTrackingData(id: string): Promise<void> {
    if (!id.trim()) throw new Error("Tracking data ID is required")
    await axiosRetry(() =>
      http.delete(`/trackers/delete/${encodeURIComponent(id)}`),
    )
  },
}

export default TrackerService
