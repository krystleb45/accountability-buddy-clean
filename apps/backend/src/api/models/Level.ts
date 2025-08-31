import type {
  LevelSchema as ILevelSchema,
  LevelDocument,
  LevelModel,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

import { Reward } from "./Reward"

// --- Main Schema ---
const LevelSchema: ILevelSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    points: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    nextLevelAt: { type: Number, default: 100, min: 1 },
    rewards: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: Reward.modelName,
        },
      ],
      default: [],
    },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes ---
LevelSchema.index({ user: 1 }, { unique: true })
LevelSchema.index({ level: -1, points: -1 })
LevelSchema.index({ lastActivity: -1 })

// --- Pre-save Hook for Level-up Logic ---
LevelSchema.pre("save", function (next): void {
  while (this.points >= this.nextLevelAt) {
    this.points -= this.nextLevelAt
    this.level += 1
    // Increase the points required for the next level by 20%
    this.nextLevelAt = Math.floor(this.nextLevelAt * 1.2)
  }
  next()
})

// --- Static Methods ---
LevelSchema.statics = {
  getTopLevels(this, limit: number) {
    return this.find()
      .sort({ level: -1, points: -1 })
      .limit(limit)
      .populate("user", "username profilePicture")
  },
}

// --- Virtuals ---
LevelSchema.virtual("totalRewards").get(function (this) {
  return this.rewards.length
})

// --- Instance Methods ---
LevelSchema.methods = {
  async addPoints(this, amount: number) {
    this.points += amount
    this.lastActivity = new Date()
    await this.save()
    return this
  },
  async addReward(this, rewardType, rewardValue: string) {
    this.rewards.push({ rewardType, rewardValue, achievedAt: new Date() })
    await this.save()
    return this
  },
}

// --- Model Export ---
export const Level: LevelModel = mongoose.model<LevelDocument, LevelModel>(
  "Level",
  LevelSchema,
)
