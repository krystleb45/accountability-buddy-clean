// src/badges/badgeApi.ts
import { isAxiosError } from 'axios'
import { http } from '@/utils/http'

//
// —————————————————————————————————————————————————————
// 1) Types
// —————————————————————————————————————————————————————
export interface ApiBadge {
  _id: string
  badgeType: string
  level: 'Bronze' | 'Silver' | 'Gold'
  progress?: number
  goal?: number
  icon?: string
  description?: string
  isShowcased?: boolean
  pointsRewarded?: number
}

interface SuccessResponse<T> {
  success: boolean
  message?: string
  data: T
}

//
// —————————————————————————————————————————————————————
// 2) Helpers
// —————————————————————————————————————————————————————
function logApiError(fn: string, error: unknown): void {
  if (isAxiosError(error)) {
    console.error(`[badgeApi] ${fn} failed:`, error.response?.data || error.message)
  } else {
    console.error(`[badgeApi] ${fn} failed:`, error)
  }
}

//
// —————————————————————————————————————————————————————
// 3) API calls (all go to /backend-api/… so Next.js rewrites to backend /…)
// —————————————————————————————————————————————————————

/**
 * GET /users/badges
 * Fetch badges the current user has earned
 * Client calls → '/backend-api/users/badges'
 * Next.js proxies to → 'http://<BACKEND_URL>/users/badges'
 */
export async function fetchUserBadges(): Promise<ApiBadge[]> {
  try {
    const resp = await http.get<SuccessResponse<{ badges: ApiBadge[] }>>(
      '/backend-api/users/badges'
    )

    if (!resp.data.success) {
      console.warn('[badgeApi] fetchUserBadges returned success=false:', resp.data.message)
      return []
    }
    return resp.data.data.badges
  } catch (err) {
    logApiError('fetchUserBadges', err)
    return []
  }
}

/**
 * GET /badges/showcase
 * Fetch all showcased badges in the system
 * Client calls → '/backend-api/badges/showcase'
 * Next.js proxies to → 'http://<BACKEND_URL>/badges/showcase'
 */
export async function fetchShowcasedBadges(): Promise<ApiBadge[]> {
  try {
    const resp = await http.get<SuccessResponse<{ showcasedBadges: ApiBadge[] }>>(
      '/backend-api/badges/showcase'
    )

    if (!resp.data.success) {
      console.warn('[badgeApi] fetchShowcasedBadges returned success=false:', resp.data.message)
      return []
    }
    return resp.data.data.showcasedBadges
  } catch (err) {
    logApiError('fetchShowcasedBadges', err)
    return []
  }
}

/**
 * POST /badges/award
 * Award a badge to a user
 * Client calls → '/backend-api/badges/award'
 * Next.js proxies to → 'http://<BACKEND_URL>/badges/award'
 */
export async function awardBadge(
  userId: string,
  badgeType: string,
  level: 'Bronze' | 'Silver' | 'Gold' = 'Bronze'
): Promise<ApiBadge | null> {
  try {
    const resp = await http.post<SuccessResponse<{ badge: ApiBadge }>>(
      '/backend-api/badges/award',
      { userId, badgeType, level }
    )

    if (!resp.data.success) {
      console.warn('[badgeApi] awardBadge returned success=false:', resp.data.message)
      return null
    }
    return resp.data.data.badge
  } catch (err) {
    logApiError('awardBadge', err)
    return null
  }
}

/**
 * POST /badges/progress/update
 * Increment progress on a badge
 * Client calls → '/backend-api/badges/progress/update'
 * Next.js proxies to → 'http://<BACKEND_URL>/badges/progress/update'
 */
export async function updateBadgeProgress(
  badgeType: string,
  increment: number
): Promise<ApiBadge | null> {
  try {
    const resp = await http.post<SuccessResponse<{ badge: ApiBadge }>>(
      '/backend-api/badges/progress/update',
      { badgeType, increment }
    )

    if (!resp.data.success) {
      console.warn('[badgeApi] updateBadgeProgress returned success=false:', resp.data.message)
      return null
    }
    return resp.data.data.badge
  } catch (err) {
    logApiError('updateBadgeProgress', err)
    return null
  }
}

/**
 * POST /badges/upgrade
 * Level up a badge
 * Client calls → '/backend-api/badges/upgrade'
 * Next.js proxies to → 'http://<BACKEND_URL>/badges/upgrade'
 */
export async function upgradeBadgeLevel(badgeType: string): Promise<ApiBadge | null> {
  try {
    const resp = await http.post<SuccessResponse<{ upgradedBadge: ApiBadge }>>(
      '/backend-api/badges/upgrade',
      { badgeType }
    )

    if (!resp.data.success) {
      console.warn('[badgeApi] upgradeBadgeLevel returned success=false:', resp.data.message)
      return null
    }
    return resp.data.data.upgradedBadge
  } catch (err) {
    logApiError('upgradeBadgeLevel', err)
    return null
  }
}

/**
 * PATCH /badges/showcase/:badgeId
 * Showcase a badge
 * Client calls → '/backend-api/badges/showcase/[badgeId]'
 * Next.js proxies to → 'http://<BACKEND_URL>/badges/showcase/[badgeId]'
 */
export async function showcaseBadge(badgeId: string): Promise<ApiBadge | null> {
  try {
    const resp = await http.patch<SuccessResponse<{ badge: ApiBadge }>>(
      `/backend-api/badges/showcase/${encodeURIComponent(badgeId)}`
    )

    if (!resp.data.success) {
      console.warn('[badgeApi] showcaseBadge returned success=false:', resp.data.message)
      return null
    }
    return resp.data.data.badge
  } catch (err) {
    logApiError('showcaseBadge', err)
    return null
  }
}

/**
 * PATCH /badges/unshowcase/:badgeId
 * Un‐showcase a badge
 * Client calls → '/backend-api/badges/unshowcase/[badgeId]'
 * Next.js proxies to → 'http://<BACKEND_URL>/badges/unshowcase/[badgeId]'
 */
export async function unshowcaseBadge(badgeId: string): Promise<ApiBadge | null> {
  try {
    const resp = await http.patch<SuccessResponse<{ badge: ApiBadge }>>(
      `/backend-api/badges/unshowcase/${encodeURIComponent(badgeId)}`
    )

    if (!resp.data.success) {
      console.warn('[badgeApi] unshowcaseBadge returned success=false:', resp.data.message)
      return null
    }
    return resp.data.data.badge
  } catch (err) {
    logApiError('unshowcaseBadge', err)
    return null
  }
}

export default {
  fetchUserBadges,
  fetchShowcasedBadges,
  awardBadge,
  updateBadgeProgress,
  upgradeBadgeLevel,
  showcaseBadge,
  unshowcaseBadge,
}
