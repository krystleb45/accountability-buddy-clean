import type {
  GamificationDocument,
  GamificationModel,
  GamificationSchema as IGamificationSchema,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

const GamificationSchema: IGamificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    level: { type: Number, default: 1 },
    points: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

/**
 * Instance method to add points (and bump level once per 100 points).
 */
GamificationSchema.methods = {
  async addPoints(this, amount: number) {
    this.points += amount
    // simple level-up logic: 1 level per 100 points
    const newLevel = Math.floor(this.points / 100) + 1
    if (newLevel > this.level) {
      this.level = newLevel
    }
    await this.save()
    return this
  },
  getPointsToNextLevel(this) {
    return 100 - (this.points - (this.level === 1 ? 0 : this.level) * 100)
  },
}

export const Gamification: GamificationModel = mongoose.model<
  GamificationDocument,
  GamificationModel
>("Gamification", GamificationSchema)
