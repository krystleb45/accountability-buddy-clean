// src/activity/activityApi.ts
import axios from "axios" // only for type‐guards

import { http } from "@/utils/http"

export interface Activity {
  _id: string
  title: string
  description?: string
  createdAt: string
  completed: boolean
  likes: number
  comments: unknown[]
}

interface SuccessResponse<T> {
  success: true
  data: T
}
interface ErrorResponse {
  success: false
  message: string
}

function logApiError(fn: string, err: unknown): void {
  if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
    console.error(`[activityApi][${fn}]`, err.response.data.message)
  } else {
    console.error(`[activityApi][${fn}]`, err)
  }
}

/** GET /activities */
export async function fetchActivities(): Promise<Activity[]> {
  try {
    const res =
      await http.get<SuccessResponse<{ activities: Activity[] }>>("/activities")
    return res.data.data.activities
  } catch (err) {
    logApiError("fetchActivities", err)
    return []
  }
}

/** GET /activities/:id */
export async function fetchActivityById(id: string): Promise<Activity | null> {
  try {
    const res = await http.get<SuccessResponse<{ activity: Activity }>>(
      `/activities/${encodeURIComponent(id)}`,
    )
    return res.data.data.activity
  } catch (err) {
    logApiError("fetchActivityById", err)
    return null
  }
}

/** POST /activities */
export async function createActivity(
  title: string,
  description?: string,
): Promise<Activity | null> {
  try {
    const res = await http.post<SuccessResponse<{ activity: Activity }>>(
      "/activities",
      { title, description },
    )
    return res.data.data.activity
  } catch (err) {
    logApiError("createActivity", err)
    return null
  }
}

/** PUT /activities/:id */
export async function updateActivity(
  id: string,
  payload: Partial<Pick<Activity, "title" | "description" | "completed">>,
): Promise<Activity | null> {
  try {
    const res = await http.put<SuccessResponse<{ activity: Activity }>>(
      `/activities/${encodeURIComponent(id)}`,
      payload,
    )
    return res.data.data.activity
  } catch (err) {
    logApiError("updateActivity", err)
    return null
  }
}

/** PATCH /activities/:id/status */
export async function toggleActivityStatus(
  id: string,
  completed: boolean,
): Promise<boolean> {
  try {
    const res = await http.patch<SuccessResponse<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}/status`,
      { completed },
    )
    return res.data.success
  } catch (err) {
    logApiError("toggleActivityStatus", err)
    return false
  }
}

/** DELETE /activities/:id */
export async function deleteActivity(id: string): Promise<boolean> {
  try {
    const res = await http.delete<SuccessResponse<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}`,
    )
    return res.data.success
  } catch (err) {
    logApiError("deleteActivity", err)
    return false
  }
}

/** POST /activities/:id/like */
export async function likeActivity(id: string): Promise<boolean> {
  try {
    const res = await http.post<SuccessResponse<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}/like`,
    )
    return res.data.success
  } catch (err) {
    logApiError("likeActivity", err)
    return false
  }
}
