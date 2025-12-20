import type {
  GoalDocument,
  GoalModel,
  GoalSchema as IGoalSchema,
} from "../../types/mongoose.gen.js"

import sanitize from "mongo-sanitize"
import mongoose, { Schema } from "mongoose"

import { Milestone } from "./Milestone.js"
import { Reminder } from "./Reminder.js"

export const commonSchemaWithCollaborationGoal = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 255 },
  description: { type: String, trim: true, maxlength: 1000 },
  status: {
    type: String,
    enum: ["not-started", "in-progress", "completed", "archived"],
    default: "not-started",
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  milestones: [
    {
      type: Schema.Types.ObjectId,
      ref: Milestone.modelName,
    },
  ],
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "private",
  },
})

// --- Main Schema ---
const GoalSchema: IGoalSchema = new Schema(
  {
    ...commonSchemaWithCollaborationGoal.obj,

    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, trim: true, maxlength: 100, required: true },
    dueDate: { type: Date, required: true },

    tags: { type: [String], default: [] },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    reminders: [
      {
        type: Schema.Types.ObjectId,
        ref: Reminder.modelName,
      },
    ],
    isPinned: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    discriminatorKey: "kind",
  },
)

// --- Indexes ---
GoalSchema.index({ user: 1, status: 1, priority: 1 })
GoalSchema.index({ title: 1 })
GoalSchema.index({ dueDate: 1 })
GoalSchema.index({ completedAt: 1 })
GoalSchema.index({ tags: 1 })

GoalSchema.virtual("isActive").get(function () {
  return this.status === "in-progress" || this.status === "not-started"
})

// --- Middleware ---
GoalSchema.pre("save", function (next) {
  this.title = sanitize(this.title)
  if (this.description) {
    this.description = sanitize(this.description)
  }
  // when status goes to completed, stamp completedAt
  if (this.isModified("status") && this.status === "completed") {
    this.completedAt = new Date()
  }
  next()
})

// --- Instance Methods ---
GoalSchema.methods = {
  async addReminder(this, message: string, remindAt: Date) {
    this.reminders.push({ message, remindAt, status: "pending" })
    await this.save()
    return this
  },
  async markMilestoneComplete(this, index: number) {
    const ms = this.milestones[index]
    if (!ms) {
      throw new Error("Milestone not found")
    }
    await Milestone.findByIdAndUpdate(ms, { status: "completed" }).exec()
    return this
  },
}

// --- Static Methods ---
GoalSchema.statics = {
  findByUser(this, userId: mongoose.Types.ObjectId, filter = {}) {
    return this.find({ user: userId, ...filter })
      .sort({ createdAt: -1 })
      .exec()
  },
  async archiveCompleted() {
    const res = await this.deleteMany({ status: "completed" }).exec()
    return { nDeleted: res.deletedCount }
  },
}

// --- Model Export ---
export const Goal: GoalModel = mongoose.model<GoalDocument, GoalModel>(
  "Goal",
  GoalSchema,
)
