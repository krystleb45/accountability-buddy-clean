import mongoose from "mongoose"

import { CustomError } from "../middleware/errorHandler.js"
import { Chat } from "../models/Chat.js"
import { Group } from "../models/Group.js"
import { MessageService } from "./message-service.js"

export class ChatService {
  static async getGroupChat(groupId: string) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new CustomError("Invalid group ID", 400)
    }

    let chat = await Chat.findOne({ groupId })

    if (!chat) {
      const groupMembers = await Group.findOne({ _id: groupId }).select(
        "members",
      )
      const memberIds = groupMembers?.members.map((m) => m.toString()) || []

      // Create new group chat if not exists
      chat = await ChatService.createGroupChat(groupId, memberIds)
    }

    return chat
  }

  static async createGroupChat(groupId: string, memberIds: string[]) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new CustomError("Invalid group ID", 400)
    }

    const participantIds = memberIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    )
    const newChat = new Chat({
      chatType: "group",
      groupId: new mongoose.Types.ObjectId(groupId),
      participants: participantIds,
      messages: [],
      unreadMessages: [],
    })
    return await newChat.save()
  }

  /**
   * Fetch paginated messages for a chat.
   */
  static async fetchMessages(
    chatId: string,
    options: {
      limit?: number
      page?: number
      before?: string
    } = {},
  ) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new Error("Invalid chat ID")
    }

    return MessageService.getMessagesInThread(chatId, options)
  }

  /**
   * Get chat by ID.
   */
  static async getChatById(chatId: string) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new CustomError("Invalid chat ID", 400)
    }

    const chat = await Chat.findById(chatId)
    if (!chat) {
      throw new CustomError("Chat not found", 404)
    }
    return chat
  }

  /**
   * Delete a chat by ID.
   */
  static async deleteChat(chatId: string) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new CustomError("Invalid chat ID", 400)
    }

    await MessageService.deleteMessagesByChatId(chatId)

    await Chat.findByIdAndDelete(chatId)
  }

  /**
   * Get existing private chat between two users, or create one.
   */
  static async getOrCreatePrivateChat(userA: string, userB: string) {
    const a = new mongoose.Types.ObjectId(userA)
    const b = new mongoose.Types.ObjectId(userB)

    const chat = await Chat.findOne({
      chatType: "private",
      participants: { $all: [a, b] },
    }).exec()

    if (!chat) {
      return await Chat.create({
        chatType: "private",
        participants: [a, b],
        messages: [],
        unreadMessages: [],
      })
    }

    return chat
  }

  /**
   * Send message in a chat
   */
  static async sendMessage({
    chatId,
    senderId,
    receiverId,
    content,
  }: {
    chatId: string
    senderId: string
    receiverId?: string
    content: string
  }) {
    const chat = await ChatService.getChatById(chatId)

    const isGroupMessage = chat.chatType === "group"

    const message = await MessageService.sendMessage({
      chatId,
      senderId,
      recipientId: isGroupMessage ? undefined : receiverId,
      content,
      messageType: isGroupMessage ? "group" : "private",
    })

    await chat.addMessage(message._id, new mongoose.Types.ObjectId(senderId))

    return message
  }
  // /**
  //  * Update an existing message’s text + status.
  //  */
  // static async editMessage(
  //   messageId: string,
  //   encryptedText: string,
  // ): Promise<void> {
  //   if (!Types.ObjectId.isValid(messageId)) {
  //     throw new Error("Invalid message ID")
  //   }
  //   await Message.findByIdAndUpdate(messageId, {
  //     text: encryptedText,
  //     status: "edited",
  //   }).exec()
  // }
  // /**
  //  * Soft-delete a message (replace text + status).
  //  */
  // static async deleteMessage(messageId: string): Promise<void> {
  //   if (!Types.ObjectId.isValid(messageId)) {
  //     throw new Error("Invalid message ID")
  //   }
  //   await Message.findByIdAndUpdate(messageId, {
  //     text: "This message has been deleted.",
  //     status: "deleted",
  //   }).exec()
  // }
  // /**
  //  * Reset unread count for a user in a chat.
  //  */
  // static async markRead(chatId: string, userId: string): Promise<void> {
  //   if (!Types.ObjectId.isValid(chatId)) {
  //     throw new Error("Invalid chat ID")
  //   }
  //   await Chat.updateOne(
  //     { _id: chatId, "unreadMessages.userId": userId },
  //     { $set: { "unreadMessages.$.count": 0 } },
  //   ).exec()
  // }
  // /**
  //  * Fetch all messages in a private chat (no pagination).
  //  */
  // static async fetchPrivateHistory(
  //   userA: string,
  //   userB: string,
  // ): Promise<IMessage[]> {
  //   const chat = await Chat.findOne({
  //     chatType: "private",
  //     participants: {
  //       $all: [new Types.ObjectId(userA), new Types.ObjectId(userB)],
  //     },
  //   }).exec()
  //   if (!chat) {
  //     throw new Error("Private chat not found")
  //   }
  //   return Message.find({ chatId: chat._id }).sort({ timestamp: 1 }).exec()
  // }

  /**
   * Mark messages as read for a user in a chat.
   */
  static async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new CustomError("Invalid chat ID", 400)
    }

    const chat = await Chat.findById(chatId)
    if (chat) {
      await chat.markRead(new mongoose.Types.ObjectId(userId))
    }
  }
}
