import type { FriendRequestStatus } from "@ab/shared/friends"
import type { Types } from "mongoose"
import type {
  FriendRequestDocument,
  FriendRequestModel,
  FriendRequestSchema as IFriendRequestSchema,
} from "src/types/mongoose.gen"

import { FRIENDSHIP_STATUS } from "@ab/shared/friends"
import mongoose, { Schema } from "mongoose"

// --- Schema Definition ---
const FriendRequestSchema: IFriendRequestSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: FRIENDSHIP_STATUS,
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes ---
// Prevent duplicate requests and speed lookups
FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true })
FriendRequestSchema.index({ recipient: 1, status: 1 })
FriendRequestSchema.index({ sender: 1 })

// --- Static Methods ---
FriendRequestSchema.statics = {
  async sendRequest(sender: Types.ObjectId, recipient: Types.ObjectId) {
    const existing = await this.findOne({ sender, recipient })
    if (existing) {
      throw new Error("Friend request already exists")
    }
    return this.create({ sender, recipient })
  },
  async respondRequest(requestId: Types.ObjectId, status: FriendRequestStatus) {
    const req = await this.findById(requestId)
    if (!req) {
      return null
    }
    req.status = status
    await req.save()
    return req
  },
  getRequestsForUser(userId: Types.ObjectId, status?: FriendRequestStatus) {
    const filter: Record<string, unknown> = { recipient: userId }
    if (status) {
      filter.status = status
    }
    return this.find(filter)
      .sort({ createdAt: -1 })
      .populate("sender", "username profileImage")
  },
}

// --- Model Export ---
export const FriendRequest: FriendRequestModel = mongoose.model<
  FriendRequestDocument,
  FriendRequestModel
>("FriendRequest", FriendRequestSchema)
