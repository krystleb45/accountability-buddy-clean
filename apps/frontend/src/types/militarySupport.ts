// src/types/military-support.ts

// Existing types for military support resources
export type ResourceCategory =
  | "hotline"
  | "website"
  | "forum"
  | "organization"
  | "other"

export interface SupportResource {
  _id: string
  title: string
  url: string
  description?: string
  category: ResourceCategory
  isActive: boolean
  createdAt: string
  updatedAt: string
  domain?: string // Virtual field from backend
}

export interface Disclaimer {
  disclaimer: string
}

// NEW: Mood check-in types
export interface MoodCheckIn {
  mood: number // 1-5 scale
  note?: string
  sessionId: string
  timestamp: Date
}

export interface CommunityMoodData {
  averageMood: number
  totalCheckIns: number
  moodDistribution: {
    mood1: number
    mood2: number
    mood3: number
    mood4: number
    mood5: number
  }
  lastUpdated: Date
  encouragementMessage: string
}

export interface MoodTrend {
  date: string
  averageMood: number
  checkInCount: number
}

export interface MoodOption {
  value: number
  emoji: string
  label: string
  color: string
}
