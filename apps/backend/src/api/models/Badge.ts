import type {
  BadgeDocument,
  BadgeModel,
  BadgeSchema as IBadgeSchema,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

// --- Schema Definition ---
const BadgeSchema: IBadgeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badgeType: {
      type: String,
      enum: [
        "goal_completed",
        "helper",
        "milestone_achiever",
        "consistency_master",
        "time_based",
        "event_badge",
      ],
      required: true,
    },
    description: { type: String, default: "", trim: true },
    level: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
    progress: { type: Number, default: 0 },
    goal: { type: Number, default: 1 },
    dateAwarded: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isShowcased: { type: Boolean, default: false },
    event: { type: String, default: "", trim: true },
    pointsRewarded: { type: Number, default: 0 },
    badgeIconUrl: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes (declare once here) ---
BadgeSchema.index({ user: 1, badgeType: 1, level: 1 })

// --- Virtuals ---
BadgeSchema.virtual("isExpired").get(function (this): boolean {
  return Boolean(this.expiresAt && this.expiresAt < new Date())
})

// --- Instance Methods ---
BadgeSchema.methods = {
  async updateProgress(this, amount: number) {
    this.progress += amount
    if (this.progress >= this.goal) {
      // bump level, reset progress, award points, update date
      this.level = (this.constructor as BadgeModel).getNextLevel(this.level)
      this.progress = 0
      this.dateAwarded = new Date()
      this.pointsRewarded += (
        this.constructor as BadgeModel
      ).awardPointsForBadge(this.badgeType)
    }
    await this.save()
    return this
  },
}

// --- Static Methods ---
BadgeSchema.statics = {
  getNextLevel(currentLevel) {
    const levels = ["Bronze", "Silver", "Gold"]
    const idx = levels.indexOf(currentLevel)
    return levels[idx + 1] || currentLevel
  },
  isExpired(expiresAt?: Date) {
    return Boolean(expiresAt && expiresAt < new Date())
  },
  awardPointsForBadge(badgeType) {
    const mapping = {
      goal_completed: 50,
      helper: 30,
      milestone_achiever: 100,
      consistency_master: 75,
      time_based: 40,
      event_badge: 20,
    }
    return mapping[badgeType] || 0
  },
}

// --- Hooks ---
BadgeSchema.pre("save", function (next) {
  if (this.progress < 0) {
    return next(new Error("Progress cannot be negative"))
  }
  next()
})

// --- Model Export ---
export const Badge: BadgeModel = mongoose.model<BadgeDocument, BadgeModel>(
  "Badge",
  BadgeSchema,
)
