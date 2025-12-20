import type {
  MessageSchema as IMessageSchema,
  MessageDocument,
  MessageModel,
} from "../../types/mongoose.gen.js"

import { messageStatuses } from "@ab/shared/message"
import mongoose, { Schema } from "mongoose"

// --- Reaction Subdocument ---
const ReactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
    reactedAt: { type: Date, default: (): Date => new Date() },
  },
  { _id: false },
)

// --- Attachment Subdocument ---
const AttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ["image", "video", "file"], required: true },
  },
  { _id: false },
)

// --- Schema Definition ---
const MessageSchema: IMessageSchema = new Schema(
  {
    // equal to groupId for group messages
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User" }, // null for group messages
    text: { type: String, trim: true },
    messageType: { type: String, enum: ["private", "group"], required: true },
    status: {
      type: String,
      enum: messageStatuses,
      default: "sent",
    },
    reactions: { type: [ReactionSchema], default: [] },
    attachments: { type: [AttachmentSchema], default: [] },
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Virtuals ---
MessageSchema.virtual("reactionCount").get(function (this): number {
  return this.reactions.length
})

MessageSchema.virtual("attachmentCount").get(function (this): number {
  return this.attachments.length
})

// --- Middleware ---
MessageSchema.pre("save", function (next): void {
  if (this.isModified("text") && this.status !== "deleted") {
    this.status = "edited"
  }
  next()
})

// --- Instance Methods ---
MessageSchema.methods = {
  async addReaction(this, userId: mongoose.Types.ObjectId, emoji: string) {
    this.reactions.push({ userId, emoji, reactedAt: new Date() })
    await this.save()
    return this
  },
  async removeReaction(this, userId: mongoose.Types.ObjectId) {
    this.reactions.pull({ userId })
    await this.save()
    return this
  },
  async edit(this, newText: string) {
    this.text = newText
    this.status = "edited"
    await this.save()
    return this
  },
  async softDelete(this) {
    this.status = "deleted"
    await this.save()
    return this
  },
}

// --- Static Methods ---
MessageSchema.statics = {
  getByChat(this, chatId: mongoose.Types.ObjectId, limit = 50) {
    return this.find({ chatId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate("senderId", "username profileImage")
      .populate("reactions.userId", "username")
      .exec()
  },
  getUserMessages(this, userId: mongoose.Types.ObjectId, limit = 50) {
    return this.find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate("chatId")
      .exec()
  },
}

// --- Indexes ---
MessageSchema.index({ chatId: 1, timestamp: -1 })
MessageSchema.index({ senderId: 1, receiverId: 1, timestamp: -1 })
MessageSchema.index({ status: 1 })
MessageSchema.index({ replyTo: 1 })

// --- Model Export ---
export const Message: MessageModel = mongoose.model<
  MessageDocument,
  MessageModel
>("Message", MessageSchema)
