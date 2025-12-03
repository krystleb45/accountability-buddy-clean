import mongoose, { Schema } from "mongoose"

import type {
  ChatDocument,
  ChatModel,
  ChatSchema as IChatSchema,
} from "../../types/mongoose.gen.js"

// --- Schema Definition ---
const ChatSchema: IChatSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [{ type: Schema.Types.ObjectId, ref: "Message", required: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    chatType: { type: String, enum: ["private", "group"], required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" }, // for group chats
    unreadMessages: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        count: { type: Number, default: 0 },
      },
    ],
    typingUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Indexes ---
ChatSchema.index({ participants: 1, createdAt: -1 })
ChatSchema.index({ "unreadMessages.userId": 1 })
ChatSchema.index({ isPinned: 1 })

// --- Virtuals ---
ChatSchema.virtual("participantCount").get(function (this): number {
  return this.participants.length
})

// --- Instance Methods ---
ChatSchema.methods = {
  async addMessage(
    this,
    messageId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ) {
    this.messages.push(messageId)
    this.lastMessage = messageId
    this.participants.forEach((participant) => {
      // increment unread for others
      if (!participant._id.equals(userId)) {
        const um = this.unreadMessages.find((u) =>
          u.userId._id.equals(participant._id),
        )
        if (um) {
          um.count += 1
        } else {
          this.unreadMessages.push({ userId: participant._id, count: 1 })
        }
      }
    })
    await this.save()
    return this
  },
  async markRead(this, userId: mongoose.Types.ObjectId) {
    const um = this.unreadMessages.find((u) => u.userId._id.equals(userId))
    if (um) {
      um.count = 0
    }
    await this.save()
    return this
  },
  async addTypingUser(this, userId: mongoose.Types.ObjectId) {
    if (!this.typingUsers.includes(userId)) {
      this.typingUsers.push(userId)
    }
    await this.save()
    return this
  },
  async removeTypingUser(this, userId: mongoose.Types.ObjectId) {
    this.typingUsers.pull(userId)
    await this.save()
    return this
  },
}

// --- Static Methods ---
ChatSchema.statics = {
  getUserChats(userId: mongoose.Types.ObjectId) {
    return this.find({ participants: userId }).sort({ updatedAt: -1 })
  },
  getGroupChats() {
    return this.find({ chatType: "group" }).sort({ createdAt: -1 })
  },
}

// --- Model Export ---
export const Chat: ChatModel = mongoose.model<ChatDocument, ChatModel>(
  "Chat",
  ChatSchema,
)
