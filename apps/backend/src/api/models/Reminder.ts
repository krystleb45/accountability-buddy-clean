import type {
  ReminderSchema as IReminderSchema,
  ReminderDocument,
  ReminderModel,
} from "../../types/mongoose.gen.js"

import mongoose, { Schema } from "mongoose"

// --- Schema Definition ---
const ReminderSchema: IReminderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 255 },
    goal: { type: Schema.Types.ObjectId, ref: "Goal" },
    remindAt: {
      type: Date,
      required: true,
      validate: {
        validator: (value: Date): boolean => value.getTime() > Date.now(),
        message: "Reminder time must be in the future",
      },
    },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    isActive: { type: Boolean, default: true },
    isSent: { type: Boolean, default: false },
    reminderType: {
      type: String,
      enum: ["email", "sms", "app"],
      default: "app",
    },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string): boolean =>
          !v || /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(v),
        message: "Invalid email address",
      },
    },
    lastSent: { type: Date },
    endRepeat: {
      type: Date,
      validate: {
        validator(this, value: Date): boolean {
          return !value || value.getTime() > this.remindAt.getTime()
        },
        message: "End repeat must be after remindAt",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes ---
ReminderSchema.index({ user: 1, remindAt: 1 })
ReminderSchema.index({ recurrence: 1 })
ReminderSchema.index({ isActive: 1 })
ReminderSchema.index({ isSent: 1 })
ReminderSchema.index({ goal: 1 })

// --- Virtual ---
ReminderSchema.virtual("isRecurring").get(function (this): boolean {
  return this.recurrence !== "none"
})

// --- Middleware ---
ReminderSchema.pre("save", function (next): void {
  if (this.isModified("message")) {
    this.message = this.message.trim()
  }
  if (this.recurrence !== "none" && !this.endRepeat) {
    return next(
      new Error("End repeat date is required for recurring reminders"),
    )
  }
  next()
})

// --- Instance Methods ---
ReminderSchema.methods = {
  async deactivate(this) {
    this.isActive = false
    return this.save()
  },
  async markAsSent(this) {
    this.isSent = true
    this.lastSent = new Date()
    return this.save()
  },
}

// --- Static Methods ---
ReminderSchema.statics = {
  getUpcomingRemindersForUser(this, userId: mongoose.Types.ObjectId) {
    return this.find({
      user: userId,
      remindAt: { $gte: new Date() },
      isSent: false,
      isActive: true,
    })
      .sort({ remindAt: 1 })
      .exec()
  },
  getUpcomingRemindersInRange(this, start: Date, end: Date) {
    return this.find({
      isActive: true,
      remindAt: { $gte: start, $lte: end },
      isSent: false,
    }).exec()
  },
  getUserReminders(this, userId: mongoose.Types.ObjectId, filters = {}) {
    return this.find({ user: userId, ...filters } as any).exec()
  },
}

// --- Model Export ---
export const Reminder: ReminderModel = mongoose.model<
  ReminderDocument,
  ReminderModel
>("Reminder", ReminderSchema)
