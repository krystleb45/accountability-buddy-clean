// src/rewards/rewardApi.ts

import axios from "axios"

import { http } from "@/utils/http"

export interface Reward {
  _id: string
  id: string
  title: string
  description?: string
  pointsRequired: number
  rewardType: string
  imageUrl?: string
  createdAt: string
}

function logError(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [rewardApi::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [rewardApi::${fn}]`, error)
  }
}

/** GET /rewards */
export async function fetchRewards(): Promise<Reward[]> {
  try {
    const resp = await http.get<Reward[]>("/rewards")
    return resp.data
  } catch (err) {
    logError("fetchRewards", err)
    return []
  }
}

/** POST /rewards/:id/redeem */
export async function redeemReward(rewardId: string): Promise<Reward | null> {
  if (!rewardId.trim()) {
    console.error("[rewardApi] redeemReward: rewardId is required")
    return null
  }
  try {
    const resp = await http.post<Reward>(
      `/rewards/${encodeURIComponent(rewardId)}/redeem`,
    )
    return resp.data
  } catch (err) {
    logError("redeemReward", err)
    return null
  }
}

/** POST /rewards */
export async function createReward(
  data: Partial<Reward>,
): Promise<Reward | null> {
  try {
    const resp = await http.post<Reward>("/rewards", data)
    return resp.data
  } catch (err) {
    logError("createReward", err)
    return null
  }
}

export default {
  fetchRewards,
  redeemReward,
  createReward,
}
