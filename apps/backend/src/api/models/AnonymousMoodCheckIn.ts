import { endOfToday, startOfToday, sub } from "date-fns"
import mongoose, { Schema } from "mongoose"

import type {
  AnonymousMoodCheckInDocument,
  AnonymousMoodCheckInModel,
  AnonymousMoodCheckInSchema as IAnonymousMoodCheckInSchema,
} from "../../types/mongoose.gen.js"

// Interface for aggregated mood data
export interface IAggregatedMoodData {
  date: string
  averageMood: number
  totalCheckIns: number
  moodDistribution: {
    mood1: number
    mood2: number
    mood3: number
    mood4: number
    mood5: number
  }
}

const AnonymousMoodCheckInSchema: IAnonymousMoodCheckInSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
      trim: true,
      maxlength: 100,
    },
    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator(v: number): boolean {
          return Number.isInteger(v) && v >= 1 && v <= 5
        },
        message: "Mood must be an integer between 1 and 5",
      },
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 45, // IPv6 max length
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient queries
AnonymousMoodCheckInSchema.index({ sessionId: 1, createdAt: -1 })
AnonymousMoodCheckInSchema.index({ createdAt: -1 })
AnonymousMoodCheckInSchema.index({ mood: 1 })

// Static method to get today's mood distribution
AnonymousMoodCheckInSchema.statics = {
  async getTodaysMoodDistribution() {
    const today = new Date()
    const startOfDay = startOfToday()
    const endOfDay = endOfToday()

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          averageMood: { $avg: "$mood" },
          totalCheckIns: { $sum: 1 },
          mood1: { $sum: { $cond: [{ $eq: ["$mood", 1] }, 1, 0] } },
          mood2: { $sum: { $cond: [{ $eq: ["$mood", 2] }, 1, 0] } },
          mood3: { $sum: { $cond: [{ $eq: ["$mood", 3] }, 1, 0] } },
          mood4: { $sum: { $cond: [{ $eq: ["$mood", 4] }, 1, 0] } },
          mood5: { $sum: { $cond: [{ $eq: ["$mood", 5] }, 1, 0] } },
        },
      },
    ]

    const result = await this.aggregate(pipeline)

    if (result.length === 0) {
      return {
        date: today.toISOString().split("T")[0],
        averageMood: 3, // Default neutral mood
        totalCheckIns: 0,
        moodDistribution: {
          mood1: 0,
          mood2: 0,
          mood3: 0,
          mood4: 0,
          mood5: 0,
        },
      }
    }

    const data = result[0]
    return {
      date: today.toISOString().split("T")[0],
      averageMood: Math.round(data.averageMood * 10) / 10, // Round to 1 decimal
      totalCheckIns: data.totalCheckIns,
      moodDistribution: {
        mood1: data.mood1,
        mood2: data.mood2,
        mood3: data.mood3,
        mood4: data.mood4,
        mood5: data.mood5,
      },
    }
  },
  // Static method to get mood trends over time
  async getMoodTrends(days = 7) {
    const endDate = new Date()
    const startDate = sub(endDate, { days })

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          averageMood: { $avg: "$mood" },
          totalCheckIns: { $sum: 1 },
          mood1: { $sum: { $cond: [{ $eq: ["$mood", 1] }, 1, 0] } },
          mood2: { $sum: { $cond: [{ $eq: ["$mood", 2] }, 1, 0] } },
          mood3: { $sum: { $cond: [{ $eq: ["$mood", 3] }, 1, 0] } },
          mood4: { $sum: { $cond: [{ $eq: ["$mood", 4] }, 1, 0] } },
          mood5: { $sum: { $cond: [{ $eq: ["$mood", 5] }, 1, 0] } },
        },
      },
      {
        $sort: {
          "_id.year": 1 as const,
          "_id.month": 1 as const,
          "_id.day": 1 as const,
        },
      },
    ]

    const results = await this.aggregate(pipeline)

    return results.map((item: any) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, "0")}-${String(item._id.day).padStart(2, "0")}`,
      averageMood: Math.round(item.averageMood * 10) / 10, // Round to 1 decimal
      totalCheckIns: item.totalCheckIns,
      moodDistribution: {
        mood1: item.mood1,
        mood2: item.mood2,
        mood3: item.mood3,
        mood4: item.mood4,
        mood5: item.mood5,
      },
    }))
  },

  // Static method to check if session has submitted today
  async hasSubmittedToday(sessionId: string) {
    const startOfDay = startOfToday()
    const endOfDay = endOfToday()

    const count = await this.countDocuments({
      sessionId,
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })

    return count > 0
  },
}

// Pre-save middleware to clean up data
AnonymousMoodCheckInSchema.pre("save", function (next) {
  // Clean up note field
  if (this.note) {
    this.note = this.note.trim()
    if (this.note.length === 0) {
      this.note = undefined
    }
  }

  next()
})

// Export the model
export const AnonymousMoodCheckIn: AnonymousMoodCheckInModel = mongoose.model<
  AnonymousMoodCheckInDocument,
  AnonymousMoodCheckInModel
>("AnonymousMoodCheckIn", AnonymousMoodCheckInSchema)
