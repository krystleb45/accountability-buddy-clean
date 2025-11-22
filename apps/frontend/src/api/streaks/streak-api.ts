import type { Envelope } from "@/types"
import type { Streak } from "@/types/mongoose.gen"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

/** Fetch the current user's streak */
export async function fetchUserStreak() {
  try {
    const resp = await http.get<Envelope<{ streak: Streak }>>("/streaks")
    return resp.data.data.streak
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
