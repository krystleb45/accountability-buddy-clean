// src/types/Recommendations.types.ts

/**
 * A recommended book
 */
export interface BookRecommendation {
  /** Unique ID */
  id: string
  /** Title of the book */
  title: string
  /** Author name */
  author: string
  /** Short description or blurb */
  description: string
  /** Optional URL to learn more */
  link?: string
}

/**
 * A recommended community/group
 */
export interface GroupRecommendation {
  /** Unique ID */
  id: string
  /** Name of the group */
  name: string
  /** Brief description of the group */
  description: string
  /** Number of members in the group */
  membersCount: number
}

/**
 * A recommended individual (e.g. peer to connect with)
 */
export interface IndividualRecommendation {
  /** Unique ID */
  id: string
  /** Person’s name */
  name: string
  /** Short bio or headline */
  bio: string
  /** List of shared goal titles */
  sharedGoals: string[]
}
