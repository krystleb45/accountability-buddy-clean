import mongoose, { Schema } from "mongoose"

import type { Document, Model } from "mongoose"

export interface IGoalInvitation {
  goal: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  recipient: mongoose.Types.ObjectId
  status: "pending" | "accepted" | "declined"
  message?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface GoalInvitationDocument extends IGoalInvitation, Document {}

export interface GoalInvitationModel extends Model<GoalInvitationDocument> {}

const GoalInvitationSchema = new Schema<GoalInvitationDocument>(
  {
    goal: { 
      type: Schema.Types.ObjectId, 
      ref: "CollaborationGoal", 
      required: true 
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    message: { 
      type: String, 
      maxlength: 500 
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
GoalInvitationSchema.index({ recipient: 1, status: 1 })
GoalInvitationSchema.index({ goal: 1 })
GoalInvitationSchema.index({ sender: 1 })
// Prevent duplicate pending invitations
GoalInvitationSchema.index(
  { goal: 1, recipient: 1, status: 1 }, 
  { unique: true, partialFilterExpression: { status: "pending" } }
)

export const GoalInvitation = mongoose.model<GoalInvitationDocument, GoalInvitationModel>(
  "GoalInvitation",
  GoalInvitationSchema
)
