import type {
  AnonymousMilitaryMessageDocument,
  AnonymousMilitaryMessageModel,
  AnonymousSessionDocument,
  AnonymousSessionModel,
  AnonymousMilitaryMessageSchema as IAnonymousMilitaryMessageSchema,
  AnonymousSessionSchema as IAnonymousSessionSchema,
} from "src/types/mongoose.gen"

import { subMinutes } from "date-fns"
import mongoose, { Schema } from "mongoose"

// Anonymous Message Schema (24-hour auto-deletion for privacy)
const AnonymousMilitaryMessageSchema: IAnonymousMilitaryMessageSchema =
  new Schema(
    {
      room: {
        type: String,
        required: true,
        enum: ["veterans-support", "active-duty", "family-members"],
      },
      anonymousSessionId: {
        type: String,
        required: true,
        index: true,
      },
      displayName: {
        type: String,
        required: true,
        maxlength: 50,
      },
      message: {
        type: String,
        required: true,
        maxlength: 500,
      },
      isFlagged: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
      // Auto-delete after 24 hours for privacy
      expires: 86400,
    },
  )

// Index for efficient queries
AnonymousMilitaryMessageSchema.index({ room: 1, createdAt: -1 })

// Anonymous Session Schema (1-hour auto-cleanup)
const AnonymousSessionSchema: IAnonymousSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    room: {
      type: String,
      required: true,
      enum: ["veterans-support", "active-duty", "family-members"],
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // Auto-delete after 1 hour of inactivity
    expires: 3600,
  },
)

AnonymousSessionSchema.index({ sessionId: 1 })
AnonymousSessionSchema.index({ room: 1 })
AnonymousSessionSchema.index({ room: 1, lastActive: -1 })

AnonymousSessionSchema.statics = {
  async getActiveSessionsInRoom(room: string) {
    // lastActive in the past 5 minutes
    const fiveMinutesAgo = subMinutes(new Date(), 5)
    return this.countDocuments({
      room,
      lastActive: { $gte: fiveMinutesAgo },
    }).exec()
  },
}

export const AnonymousMilitaryMessage: AnonymousMilitaryMessageModel =
  mongoose.model<
    AnonymousMilitaryMessageDocument,
    AnonymousMilitaryMessageModel
  >("AnonymousMilitaryMessage", AnonymousMilitaryMessageSchema)
export const AnonymousSession: AnonymousSessionModel = mongoose.model<
  AnonymousSessionDocument,
  AnonymousSessionModel
>("AnonymousSession", AnonymousSessionSchema)
