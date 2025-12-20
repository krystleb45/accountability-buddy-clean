import { BADGE_CONDITIONS } from "@ab/shared/badge-conditions"
import mongoose, { Schema } from "mongoose"

import type {
  BadgeTypeDocument,
  BadgeTypeModel,
  BadgeTypeSchema as IBadgeTypeSchema,
} from "../../types/mongoose.gen.js"

import { FileUploadService } from "../services/file-upload-service.js"

const BadgeTypeSchema: IBadgeTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    bronzePointsToAward: {
      type: Number,
      default: 0,
      min: 0,
    },
    silverPointsToAward: {
      type: Number,
      default: 0,
      min: 0,
    },
    goldPointsToAward: {
      type: Number,
      default: 0,
      min: 0,
    },
    iconKey: {
      type: String,
    },
    conditionToMeet: {
      type: String,
      required: true,
      enum: BADGE_CONDITIONS,
    },
    bronzeAmountRequired: {
      type: Number,
      default: 1,
      min: 1,
    },
    silverAmountRequired: {
      type: Number,
      default: 5,
      min: 1,
    },
    goldAmountRequired: {
      type: Number,
      default: 10,
      min: 1,
    },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

/* ======= INDICES ======= */
BadgeTypeSchema.index({ name: 1 }, { unique: true })

/* ======= VIRTUALS ======= */
BadgeTypeSchema.virtual("isExpired").get(function (this) {
  return Boolean(this.expiresAt && this.expiresAt < new Date())
})

/* ======= METHODS ======= */
BadgeTypeSchema.methods = {
  async getIconUrl(this) {
    if (!this.iconKey) {
      return null
    }
    try {
      return await FileUploadService.generateSignedUrl(this.iconKey)
    } catch (error) {
      console.error("Error generating presigned URL:", error)
      return null
    }
  },
}

/* ======= MODEL EXPORT ======= */
export const BadgeType: BadgeTypeModel = mongoose.model<
  BadgeTypeDocument,
  BadgeTypeModel
>("BadgeType", BadgeTypeSchema)
