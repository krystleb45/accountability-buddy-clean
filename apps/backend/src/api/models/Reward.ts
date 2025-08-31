import type {
  RewardSchema as IRewardSchema,
  RewardDocument,
  RewardModel,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

// --- Schema Definition ---
const RewardSchema: IRewardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 1,
    },
    rewardType: {
      type: String,
      enum: ["badge", "discount", "giftCard", "recognition"],
      required: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  },
)

// --- Indexes ---
RewardSchema.index({ name: 1 }, { unique: true })
RewardSchema.index({ pointsRequired: 1 })
RewardSchema.index({ rewardType: 1 })

RewardSchema.statics = {
  getAvailableRewards(this, maxPoints: number) {
    return this.find({ pointsRequired: { $lte: maxPoints } })
      .sort({ pointsRequired: 1 })
      .exec()
  },
}

// --- Model Export ---
export const Reward: RewardModel = mongoose.model<RewardDocument, RewardModel>(
  "Reward",
  RewardSchema,
)
