// src/admin/rewardApi.ts
import axios from 'axios'               // for isAxiosError check
import { http } from '@/utils/http'     // our shared Axios instance

// ----------------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------------
export interface AdminReward {
  _id: string
  name: string
  description: string
  imageUrl?: string
  points: number
}

// Envelope shapes used by your backend
interface SuccessResponse<T> {
  success: true
  message: string
  data: T
}

interface ErrorResponse {
  success: false
  message: string
}

// ----------------------------------------------------------------------------------
// Helper: uniform error logger
// ----------------------------------------------------------------------------------
const logApiError = (scope: string, err: unknown): void => {
  if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
    console.error(`[rewardApi][${scope}]`, err.response.data)
  } else {
    console.error(`[rewardApi][${scope}]`, err)
  }
}

// ----------------------------------------------------------------------------------
// API Functions
// ----------------------------------------------------------------------------------

/**
 * Fetch all rewards (admin)
 * GET /admin/rewards
 *
 * Backend should return:
 *   { success: true, message: "...", data: { rewards: AdminReward[] } }
 */
export async function fetchAdminRewards(): Promise<AdminReward[]> {
  try {
    const res = await http.get<SuccessResponse<{ rewards: AdminReward[] }>>(
      '/admin/rewards'
    )
    return res.data.data.rewards
  } catch (err) {
    logApiError('fetchAdminRewards', err)
    return []    // return empty list on error
  }
}

/**
 * Create a new reward (admin)
 * POST /admin/rewards
 *
 * Backend should return:
 *   { success: true, message: "...", data: { reward: AdminReward } }
 */
export async function createAdminReward(data: {
  name: string
  description: string
  imageUrl?: string
  points: number
}): Promise<AdminReward | null> {
  try {
    const res = await http.post<SuccessResponse<{ reward: AdminReward }>>(
      '/admin/rewards',
      data
    )
    return res.data.data.reward
  } catch (err) {
    logApiError('createAdminReward', err)
    return null
  }
}

/**
 * Delete a reward by ID (admin)
 * DELETE /admin/rewards/:id
 *
 * Backend should return:
 *   { success: true, message: "...", data: {} }
 */
export async function deleteAdminReward(id: string): Promise<boolean> {
  try {
    const res = await http.delete<SuccessResponse<Record<string, never>>>(
      `/admin/rewards/${encodeURIComponent(id)}`
    )
    return res.data.success
  } catch (err) {
    logApiError('deleteAdminReward', err)
    return false
  }
}

export default {
  fetchAdminRewards,
  createAdminReward,
  deleteAdminReward,
}
