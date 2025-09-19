import type { Types } from "mongoose"
import type {
  GroupDocument,
  GroupModel,
  GroupSchema as IGroupSchema,
} from "src/types/mongoose.gen"

import { groupCategories } from "@ab/shared/group-categories"
import mongoose, { Schema } from "mongoose"

// --- Subschemas ---
const UnreadSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    count: { type: Number, default: 0 },
  },
  { _id: false },
)

// --- Main Schema ---
const GroupSchema: IGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      required: true,
      enum: groupCategories,
      default: "Learning & Education",
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    isActive: { type: Boolean, default: true },
    lastActivity: { type: Date, default: Date.now },
    avatarKey: { type: String, default: null },
    tags: { type: [String], default: [], maxlength: 5 },
    unreadMessages: { type: [UnreadSchema], default: [] },
    typingUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isPinned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes ---
GroupSchema.index({ name: 1, isActive: 1 })
GroupSchema.index({ members: 1 })
GroupSchema.index({ visibility: 1 })
GroupSchema.index({ category: 1 })
GroupSchema.index({ isPublic: 1 })
GroupSchema.index({ lastActivity: -1 })
GroupSchema.index({ tags: 1 })
GroupSchema.index({ "unreadMessages.userId": 1 })

// --- Virtuals ---
GroupSchema.virtual("memberCount").get(function (this): number {
  return this.members.length
})

GroupSchema.virtual("typingCount").get(function (this): number {
  return this.typingUsers.length
})

// --- Middleware ---
GroupSchema.pre("save", function (next: (err?: Error) => void): void {
  // Ensure creator is always a member
  if (!this.members.includes(this.createdBy)) {
    this.members.push(this.createdBy)
  }

  // Update lastActivity on save
  if (this.isModified("members") || this.isNew) {
    this.lastActivity = new Date()
  }

  next()
})

// --- Instance Methods ---
GroupSchema.methods = {
  async addMember(this, userId: Types.ObjectId) {
    if (!this.members.includes(userId)) {
      this.members.push(userId)
      this.lastActivity = new Date()
      await this.save()
    }
    return this
  },
  async removeMember(this, userId: Types.ObjectId) {
    this.members.pull(userId)
    this.lastActivity = new Date()
    await this.save()
    return this
  },
  async incrementUnread(this, userId: Types.ObjectId) {
    const um = this.unreadMessages.find((u) => u.userId._id.equals(userId))
    if (um) {
      um.count += 1
    } else {
      this.unreadMessages.push({ userId, count: 1 })
    }
    await this.save()
    return this
  },
  async clearUnread(this, userId: Types.ObjectId) {
    const um = this.unreadMessages.find((u) => u.userId._id.equals(userId))
    if (um) {
      um.count = 0
      await this.save()
    }
    return this
  },
}

// --- Static Methods ---
GroupSchema.statics = {
  findPublicGroups(this) {
    return this.find({ visibility: "public", isActive: true })
      .sort({ lastActivity: -1 }) // Changed to sort by lastActivity
      .exec()
  },
}

// --- Model Export ---
export const Group: GroupModel = mongoose.model<GroupDocument, GroupModel>(
  "Group",
  GroupSchema,
)
