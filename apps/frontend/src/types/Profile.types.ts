// src/components/Profile/Profile.types.ts

import type {
  BadgeData,
  UserProgress as GamificationProgress,
} from "@/types/Gamification.types"

//
// —————————————————————————————————————————————————————
// 1) Core profile data
// —————————————————————————————————————————————————————
/** The shape returned by `profileService.getProfile()` */
export interface ProfileData {
  id: string
  name: string
  email?: string
  bio: string
  interests: string[]
  profileImage: string
  coverImage: string
  lastGoalCompletedAt?: string
}

//
// —————————————————————————————————————————————————————
// 2) Favorite badges
// —————————————————————————————————————————————————————
/** Props for FavoriteBadges if you want to supply them instead of loading internally */
export interface FavoriteBadgesProps {
  badges: BadgeData[]
}

//
// —————————————————————————————————————————————————————
// 3) Streak reminder
// —————————————————————————————————————————————————————
export interface StreakReminderProps {
  lastGoalCompletedAt?: string
  currentStreak: number
}

//
// —————————————————————————————————————————————————————
// 4) XP history graph
// —————————————————————————————————————————————————————
export interface XPEntry {
  date: string
  points: number
}

//
// —————————————————————————————————————————————————————
// 5) Profile settings
// —————————————————————————————————————————————————————
export interface UserForSettings {
  name: string
  email: string
  bio?: string
  location?: string
  interests?: string[]
  profileImage?: string
  coverImage?: string
}

export interface ProfileSettingsProps {
  user: UserForSettings
  onUpdate: (
    updatedData: UserForSettings & { password?: string },
  ) => Promise<void>
}

//
// —————————————————————————————————————————————————————
// 6) Profile stats (completed goals, followers, etc.)
// —————————————————————————————————————————————————————
export interface ProfileStatsProps {
  userId: string
}

//
// —————————————————————————————————————————————————————
// 7) Top‐level Profile component
// —————————————————————————————————————————————————————
export interface ProfileProps {
  profile: ProfileData
  badges: BadgeData[]
  progress?: GamificationProgress
}
