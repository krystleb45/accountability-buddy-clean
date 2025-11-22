import type { Envelope } from "@/types"
import type { Activity } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

interface UserActivitiesResponse {
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

/** POST /activities */
export async function createActivity(
  data: Pick<Activity, "type" | "description" | "metadata">,
) {
  try {
    const res = await http.post<Envelope<{ activity: Activity }>>(
      "/activities",
      data,
    )
    return res.data.data.activity
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function fetchAllActivities({
  page = 1,
  limit = 10,
  type,
}: {
  page?: number
  limit?: number
  type?: Activity["type"]
} = {}) {
  try {
    const res = await http.get<
      Envelope<{ activities: Activity[]; total: number }>
    >("/activities/all", {
      params: { page, limit, type },
    })
    return res.data.data
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
