import type { Envelope } from "@/types"
import type { Activity } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface UserActivitiesResponse {
  activities: Activity[]
  total: number
  pagination: { page: number; limit: number }
}

export async function fetchActivities({
  page = 1,
  limit = 10,
  type,
}: {
  page?: number
  limit?: number
  type?: Activity["type"]
} = {}) {
  try {
    const res = await http.get<Envelope<UserActivitiesResponse>>(
      "/activities",
      {
        params: { page, limit, type },
      },
    )
    return res.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** GET /activities/:id */
export async function fetchActivityById(id: string) {
  try {
    const res = await http.get<Envelope<{ activity: Activity }>>(
      `/activities/${encodeURIComponent(id)}`,
    )
    return res.data.data.activity
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /activities */
export async function createActivity(title: string, description?: string) {
  try {
    const res = await http.post<Envelope<{ activity: Activity }>>(
      "/activities",
      { title, description },
    )
    return res.data.data.activity
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** PUT /activities/:id */
export async function updateActivity(
  id: string,
  payload: Partial<Pick<Activity, "description">>,
) {
  try {
    const res = await http.put<Envelope<{ activity: Activity }>>(
      `/activities/${encodeURIComponent(id)}`,
      payload,
    )
    return res.data.data.activity
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** PATCH /activities/:id/status */
export async function toggleActivityStatus(id: string, completed: boolean) {
  try {
    const res = await http.patch<Envelope<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}/status`,
      { completed },
    )
    return res.data.success
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** DELETE /activities/:id */
export async function deleteActivity(id: string) {
  try {
    const res = await http.delete<Envelope<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}`,
    )
    return res.data.success
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /activities/:id/like */
export async function likeActivity(id: string) {
  try {
    const res = await http.post<Envelope<Record<string, never>>>(
      `/activities/${encodeURIComponent(id)}/like`,
    )
    return res.data.success
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
