import type {
  CollaborationGoalDocument,
  CollaborationGoalModel,
  CollaborationGoalSchema as ICollaborationGoalSchema,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

import { commonSchemaWithCollaborationGoal } from "./Goal"
import { Milestone } from "./Milestone"

const CollaborationGoalSchema: ICollaborationGoalSchema = new Schema(
  {
    ...commonSchemaWithCollaborationGoal.obj,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    target: { type: Number, required: true, min: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes ---
CollaborationGoalSchema.index({ title: 1 })
CollaborationGoalSchema.index({ createdBy: 1, status: 1 }) // compound index
CollaborationGoalSchema.index({ visibility: 1 })

// --- Virtuals ---
CollaborationGoalSchema.virtual("participantCount").get(function (this) {
  return this.participants.length
})
CollaborationGoalSchema.virtual("milestoneCount").get(function (this) {
  return this.milestones.length
})

// --- Middleware ---
// Ensure creator is always in participants
CollaborationGoalSchema.pre("save", function (next) {
  if (!this.participants.includes(this.createdBy)) {
    this.participants.push(this.createdBy)
  }
  next()
})

// --- Instance Methods ---
CollaborationGoalSchema.methods = {
  async updateProgress(this, newProgress: number) {
    this.progress = Math.min(this.progress + newProgress, this.target)
    this.status = this.progress < this.target ? "in-progress" : "completed"
    await this.save()
    return this
  },
  async addParticipant(this, userId: mongoose.Types.ObjectId) {
    const isUserAlreadyParticipant = this.participants.some((participant) =>
      participant._id.equals(userId),
    )
    if (!isUserAlreadyParticipant) {
      this.participants.push(userId)
      await this.save()
    }
    return this
  },
  async completeMilestone(this, index: number) {
    const ms = this.milestones[index]
    if (!ms) {
      throw new Error("Milestone not found")
    }

    const milestone = await Milestone.findById(ms._id)
    if (!milestone) {
      throw new Error("Milestone not found")
    }

    milestone.completed = true
    await this.save()
    return this
  },
}

// --- Static Methods ---
CollaborationGoalSchema.statics.fetchByVisibility = function (
  visibility: "public" | "private",
  limit = 20,
) {
  return this.find({ visibility })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("createdBy", "username email")
}

// --- Model Export ---
export const CollaborationGoal: CollaborationGoalModel = mongoose.model<
  CollaborationGoalDocument,
  CollaborationGoalModel
>("CollaborationGoal", CollaborationGoalSchema)
