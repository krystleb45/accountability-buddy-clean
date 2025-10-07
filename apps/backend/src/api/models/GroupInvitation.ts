import mongoose, { Schema } from "mongoose"

import type {
  GroupInvitationDocument,
  GroupInvitationModel,
  GroupInvitationSchema as IGroupInvitationSchema,
} from "../../types/mongoose.gen"

import { Group } from "./Group"
import { User } from "./User"

// --- Schema Definition ---
const GroupInvitationSchema: IGroupInvitationSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: Group.modelName,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  },
)

// --- Indexes ---
GroupInvitationSchema.index({ groupId: 1, recipient: 1 })
GroupInvitationSchema.index({ sender: 1 })
GroupInvitationSchema.index({ recipient: 1 })
GroupInvitationSchema.index({ status: 1 })

// --- Model Export ---
export const GroupInvitation: GroupInvitationModel = mongoose.model<
  GroupInvitationDocument,
  GroupInvitationModel
>("GroupInvitation", GroupInvitationSchema)
