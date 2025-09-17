import type {
  BadgeDocument,
  BadgeModel,
  BadgeSchema as IBadgeSchema,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

import { BadgeType } from "./BadgeType"

// --- Schema Definition ---
const BadgeSchema: IBadgeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badgeType: {
      type: Schema.Types.ObjectId,
      ref: BadgeType.modelName,
      required: true,
    },
    level: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
    progress: { type: Number, default: 0, min: 0 },
    dateAwarded: { type: Date, default: Date.now },
    isShowcased: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes (declare once here) ---
BadgeSchema.index({ user: 1, badgeType: 1, level: 1 }, { unique: true })

// --- Model Export ---
export const Badge: BadgeModel = mongoose.model<BadgeDocument, BadgeModel>(
  "Badge",
  BadgeSchema,
)
