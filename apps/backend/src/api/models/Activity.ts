import type {
  ActivityDocument,
  ActivityModel,
  ActivitySchema as IActivitySchema,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

export const ACTIVITY_TYPES = [
  "goal",
  "reminder",
  "post",
  "message",
  "login",
  "logout",
  "signup",
  "friend_request",
  "friend_accept",
  "comment",
  "reaction",
  "achievement",
] as const

// --- Schema Definition ---
const ActivitySchema: IActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },
    description: { type: String, trim: true, maxlength: 500, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    participants: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes ---
ActivitySchema.index({ user: 1, createdAt: -1 })
ActivitySchema.index({ type: 1 })
ActivitySchema.index({ isDeleted: 1 })

// --- Pre-save Hook ---
ActivitySchema.pre("save", function (next) {
  if (this.isModified("description") && this.description) {
    this.description = this.description.trim()
  }
  next()
})

// --- Instance Methods ---
ActivitySchema.methods = {
  async addParticipant(userId: mongoose.Types.ObjectId) {
    if (!this.participants.some((p) => p._id.equals(userId))) {
      this.participants.push(userId)
      await this.save()
    }
  },
  async markDeleted() {
    this.isDeleted = true
    await this.save()
  },
}

// --- Static Methods ---
ActivitySchema.statics = {
  getRecentForUser(userId: mongoose.Types.ObjectId, limit: number) {
    return this.find({ user: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec()
  },
  getByType(type) {
    return this.find({ type, isDeleted: false }).sort({ createdAt: -1 }).exec()
  },
  softDeleteByUser(userId: mongoose.Types.ObjectId) {
    return this.updateMany(
      { user: userId, isDeleted: false },
      { $set: { isDeleted: true } },
    ).exec()
  },
}

// --- Model Export ---
export const Activity: ActivityModel = mongoose.model<
  ActivityDocument,
  ActivityModel
>("Activity", ActivitySchema)
