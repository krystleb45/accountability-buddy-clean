// src/challenges/challengeApi.ts

/**
 * Challenge‐related data models
 */
export interface ChallengeParticipant {
  profilePicture: string
  user: string
  progress?: number
  joinedAt?: string
}

export interface ChallengeReward {
  rewardType: "badge" | "discount" | "prize" | "recognition"
  rewardValue: string
}

export interface Milestone {
  _id: string
  title: string
  dueDate: string
  completed: boolean
  achievedBy: string[]
}

export interface Challenge {
  _id: string
  title: string
  description: string
  goal: string
  startDate: string
  endDate: string
  status: "ongoing" | "completed" | "canceled"
  creator: {
    _id: string
    username: string
    profilePicture?: string
  }
  participants: ChallengeParticipant[]
  rewards: ChallengeReward[]
  participantCount?: number
  visibility: "public" | "private"
  progressTracking: "individual" | "team" | "both"
  createdAt: string
  updatedAt: string
  milestones: Milestone[]
}

export interface CreateChallengeInput {
  title: string
  description: string
  goal: string
  endDate: string
  visibility?: "public" | "private"
  rewards?: string[]
  progressTracking?: boolean
}

/**
 * The envelope shape your Express `sendResponse` uses for challenges:
 *   {
 *     success: boolean,
 *     message: string,
 *     data: { … }      // see each endpoint’s data shape
 *   }
 */
interface Envelope<T> {
  success: boolean
  message: string
  data: T
}

/**
 * Convert a plain object of { [k: string]: string } into `k1=v1&k2=v2`…
 * Since we use `Object.entries`, `value` is always a string (never undefined).
 */
function toQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&")
}

// ────────────────────────────────────────────────────────────────────────────────
// 1) Fetch public challenges, with optional filters, pagination, etc.
//    GET /challenges/public?filter=all&page=1&pageSize=10&category=XYZ
// ────────────────────────────────────────────────────────────────────────────────
export async function fetchPublicChallenges(
  filter?: "all" | "week" | "month",
  page = 1,
  pageSize = 10,
  category?: string,
): Promise<Challenge[]> {
  try {
    // Build query parameters
    const params: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
      ...(filter ? { filter } : {}),
      ...(category ? { category } : {}),
    }
    const query = toQueryString(params)
    const url = query
      ? `/backend-api/challenges/public?${query}`
      : `/backend-api/challenges/public`

    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      console.error("fetchPublicChallenges failed:", await res.text())
      return []
    }

    const envelope = (await res.json()) as Envelope<{ challenges: Challenge[] }>
    if (!envelope.success) {
      console.error("fetchPublicChallenges API error:", envelope.message)
      return []
    }
    return envelope.data.challenges
  } catch (err) {
    console.error("❌ [challengeApi::fetchPublicChallenges]", err)
    return []
  }
}

/**
 * 2) Fetch a single challenge by its ID:
 *    GET /challenges/:challengeId
 */
export async function fetchChallengeById(
  challengeId: string,
): Promise<Challenge | null> {
  try {
    const res = await fetch(
      `/backend-api/challenges/${encodeURIComponent(challengeId)}`,
      { cache: "no-store" },
    )
    if (!res.ok) {
      console.error("fetchChallengeById failed:", await res.text())
      return null
    }

    const envelope = (await res.json()) as Envelope<Challenge>
    if (!envelope.success) {
      console.error("fetchChallengeById API error:", envelope.message)
      return null
    }
    return envelope.data
  } catch (err) {
    console.error("❌ [challengeApi::fetchChallengeById]", err)
    return null
  }
}

/**
 * 3) Join a challenge (current user)
 *    POST /challenges/join
 *    Body: { challengeId }
 */
export async function joinChallenge(challengeId: string): Promise<boolean> {
  try {
    const res = await fetch(`/backend-api/challenges/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
      cache: "no-store",
    })
    if (!res.ok) {
      console.error("joinChallenge failed:", await res.text())
      return false
    }

    // The envelope might look like { success: true, message: "...", data: {} }
    const envelope = (await res.json()) as Envelope<unknown>
    return envelope.success
  } catch (err) {
    console.error("❌ [challengeApi::joinChallenge]", err)
    return false
  }
}

/**
 * 4) Leave a challenge (current user)
 *    POST /challenges/leave
 *    Body: { challengeId }
 */
export async function leaveChallenge(challengeId: string): Promise<boolean> {
  try {
    const res = await fetch(`/backend-api/challenges/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId }),
      cache: "no-store",
    })
    if (!res.ok) {
      console.error("leaveChallenge failed:", await res.text())
      return false
    }
    const envelope = (await res.json()) as Envelope<unknown>
    return envelope.success
  } catch (err) {
    console.error("❌ [challengeApi::leaveChallenge]", err)
    return false
  }
}

/**
 * 5) Create a new challenge:
 *    POST /challenges/create
 *    Body: CreateChallengeInput
 */
export async function createChallenge(
  input: CreateChallengeInput,
): Promise<Challenge | null> {
  try {
    const res = await fetch(`/backend-api/challenges/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    })
    if (!res.ok) {
      console.error("createChallenge failed:", await res.text())
      return null
    }

    const envelope = (await res.json()) as Envelope<{ challenge: Challenge }>
    if (!envelope.success) {
      console.error("createChallenge API error:", envelope.message)
      return null
    }
    return envelope.data.challenge
  } catch (err) {
    console.error("❌ [challengeApi::createChallenge]", err)
    return null
  }
}

/**
 * 6) Fetch the current user's participations:
 *    GET /challenges/my-participation
 */
export async function fetchUserParticipation(): Promise<Challenge[]> {
  try {
    const res = await fetch(`/backend-api/challenges/my-participation`, {
      cache: "no-store",
    })
    if (!res.ok) {
      console.error("fetchUserParticipation failed:", await res.text())
      return []
    }

    const envelope = (await res.json()) as Envelope<{
      participations: Challenge[]
    }>
    if (!envelope.success) {
      console.error("fetchUserParticipation API error:", envelope.message)
      return []
    }
    return envelope.data.participations
  } catch (err) {
    console.error("❌ [challengeApi::fetchUserParticipation]", err)
    return []
  }
}

/**
 * 7) Fetch private challenges joined by a specific user:
 *    GET /challenges/private/:userId
 */
export async function fetchPrivateChallenges(
  userId: string,
): Promise<Challenge[]> {
  try {
    const res = await fetch(
      `/backend-api/challenges/private/${encodeURIComponent(userId)}`,
      { cache: "no-store" },
    )
    if (!res.ok) {
      console.error("fetchPrivateChallenges failed:", await res.text())
      return []
    }

    const envelope = (await res.json()) as Envelope<{ challenges: Challenge[] }>
    if (!envelope.success) {
      console.error("fetchPrivateChallenges API error:", envelope.message)
      return []
    }
    return envelope.data.challenges
  } catch (err) {
    console.error("❌ [challengeApi::fetchPrivateChallenges]", err)
    return []
  }
}

export default {
  fetchPublicChallenges,
  fetchChallengeById,
  joinChallenge,
  leaveChallenge,
  createChallenge,
  fetchUserParticipation,
  fetchPrivateChallenges,
}
