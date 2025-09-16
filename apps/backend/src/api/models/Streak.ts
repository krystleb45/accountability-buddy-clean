import { addDays, isWithinInterval } from "date-fns"
import mongoose, { Schema } from "mongoose"

import type {
  StreakSchema as IStreakSchema,
  StreakDocument,
  StreakModel,
} from "../../types/mongoose.gen"

// --- Schema Definition ---
const StreakSchema: IStreakSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    streakCount: {
      type: Number,
      default: 0,
      min: [0, "Streak count cannot be negative"],
    },
    lastCheckIn: {
      type: Date,
      default: null,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, "Longest streak cannot be negative"],
    },
    checkInDates: { type: [Date], default: [] },
  },
  {
    timestamps: true,
  },
)

// --- Indexes ---
StreakSchema.index({ user: 1 }, { unique: true })

// --- Instance Methods ---
// Record a check-in: increments or resets streak based on last check-in
StreakSchema.methods = {
  async recordCheckIn(this): Promise<StreakDocument> {
    const now = new Date()
    const last = this.lastCheckIn
    if (
      last &&
      // Allow up to 1.5 days for a streak continuation
      !isWithinInterval(now, {
        start: last,
        end: addDays(last, 1.5),
      })
    ) {
      this.streakCount += 1
    } else {
      this.streakCount = 1
    }

    this.lastCheckIn = now
    this.checkInDates.push(now)

    // Update longest streak if needed
    if (this.streakCount > this.longestStreak) {
      this.longestStreak = this.streakCount
    }

    return this.save()
  },
  // Reset the streak to zero
  async resetStreak(this): Promise<StreakDocument> {
    this.streakCount = 0
    this.lastCheckIn = null
    this.longestStreak = 0
    this.checkInDates.splice(0, this.checkInDates.length) // Clear the array while preserving Mongoose array methods
    return this.save()
  },
}

// --- Model Export ---
export const Streak: StreakModel = mongoose.model<StreakDocument, StreakModel>(
  "Streak",
  StreakSchema,
)
