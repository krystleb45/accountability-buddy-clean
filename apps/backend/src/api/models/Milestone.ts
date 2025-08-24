import type {
  MilestoneSchema as IMilestoneSchema,
  MilestoneDocument,
  MilestoneModel,
} from "src/types/mongoose.gen"

import mongoose, { Schema } from "mongoose"

// --- Schema Definition ---
const MilestoneSchema: IMilestoneSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  },
)

// --- Indexes ---
MilestoneSchema.index({ dueDate: 1 })

// --- Instance Methods ---
MilestoneSchema.methods = {
  isPastDue(this) {
    return this.dueDate.getTime() < Date.now()
  },
}

// --- Static Methods ---

MilestoneSchema.statics = {
  findUpcoming(this, daysAhead = 7) {
    const now = new Date()
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    return this.find({ dueDate: { $gte: now, $lte: cutoff } })
      .sort({ dueDate: 1 })
      .exec()
  },
  findOverdue(this) {
    return this.find({ dueDate: { $lt: new Date() } })
      .sort({ dueDate: 1 })
      .exec()
  },
}

// --- Model Export ---
export const Milestone: MilestoneModel = mongoose.model<
  MilestoneDocument,
  MilestoneModel
>("Milestone", MilestoneSchema)
