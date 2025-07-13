// src/services/gamificationService.ts
import { http } from '@/utils/http'
import * as badgeApi from '../api/badge/badgeApi'
import type { ApiBadge } from '../api/badge/badgeApi'
import type { BadgeData, UserProgress } from '@/types/Gamification.types'
import axios from 'axios'

function handleError(fn: string, err: unknown): never {
  console.error(`❌ [GamificationService::${fn}]`, err)
  if (axios.isAxiosError(err) && err.response) {
    const msg = (err.response.data as { message?: string }).message
    throw new Error(msg ?? 'Server error occurred.')
  }
  if (err instanceof Error) throw err
  throw new Error('Unexpected error. Please try again.')
}

const mapApiBadge = (b: ApiBadge): BadgeData => ({
  id:          b._id,
  name:        b.badgeType,
  description: b.description  ?? '',
  imageUrl:    b.icon         ?? '',
  isEarned:    true,
  dateEarned:  (b as any).dateEarned
})

export default {
  /** Badges you’ve earned */
  async fetchBadges(): Promise<BadgeData[]> {
    try {
      const raw = await badgeApi.fetchUserBadges()
      return raw.map(mapApiBadge)
    } catch (err) {
      handleError('fetchBadges', err)
    }
  },

  /** …other badge methods… */

  /**
   * Fetch the current user's gamification progress using the auth token.
   * Hits your Next.js proxy at /api/progress → Express /api/gamification/progress
   */
  async fetchUserProgressFromToken(): Promise<UserProgress | null> {
  try {
    const response = await axios.get<UserProgress>('/api/progress', {
      withCredentials: true,
    });
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    handleError('fetchUserProgressFromToken', err);
  }
},

  /**
   * Fetch XP history for the given user.
   * (Adjust the URL if your proxy is different.)
   */
  async fetchXPHistory(userId: string): Promise<{ date: string; xp: number }[]> {
    try {
      const { data } = await http.get<{ date: string; xp: number }[]>(
        `/xp-history?userId=${encodeURIComponent(userId)}`
      )
      return data
    } catch (err) {
      handleError('fetchXPHistory', err)
    }
  },
} as const
