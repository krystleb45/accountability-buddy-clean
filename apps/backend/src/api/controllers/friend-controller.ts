import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { GetMessagesQuery } from "../routes/friends.js"

import { ChatService } from "../services/chat-service.js"
import * as FriendService from "../services/friend-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export const sendFriendRequest = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, { recipientId: string }>,
    res: Response,
  ) => {
    const userId = req.user.id
    const recipientId = req.body.recipientId

    await FriendService.sendRequest(userId, recipientId)
    sendResponse(res, 201, true, "Friend request sent")
  },
)

export const acceptFriendRequest = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, { requestId: string }>,
    res: Response,
  ) => {
    const userId = req.user.id
    const id = req.body.requestId

    await FriendService.acceptRequest(id, userId)
    sendResponse(res, 200, true, "Friend request accepted")
  },
)

export const declineFriendRequest = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, { requestId: string }>,
    res: Response,
  ) => {
    const userId = req.user.id
    const id = req.body.requestId

    await FriendService.declineRequest(id, userId)
    sendResponse(res, 200, true, "Friend request declined")
  },
)

export const getFriendsList = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id

    const list = await FriendService.listFriends(userId)
    sendResponse(res, 200, true, "Friends list", { friends: list })
  },
)

export const getPendingFriendRequests = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id

    const list = await FriendService.pendingRequests(userId)

    sendResponse(res, 200, true, "Pending requests", { requests: list })
  },
)

export const getAIRecommendedFriends = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id

    const recs = await FriendService.aiRecommendations(userId)

    // Make sure this matches what your frontend expects
    sendResponse(res, 200, true, "Recommendations", {
      recommendedFriends: recs,
    })
  },
)

export const sendMessageToFriend = catchAsync(
  async (
    req: AuthenticatedRequest<
      { friendId: string },
      unknown,
      { message: string }
    >,
    res: Response,
  ) => {
    const userId = req.user.id
    const friendId = req.params.friendId
    const message = req.body.message

    await FriendService.sendMessage(userId, friendId, message, globalThis.io)

    sendResponse(res, 200, true, "Message sent to friend")
  },
)

export const getMessagesWithFriend = catchAsync(
  async (
    req: AuthenticatedRequest<
      { friendId: string },
      unknown,
      unknown,
      GetMessagesQuery
    >,
    res: Response,
  ) => {
    const userId = req.user.id
    const friendId = req.params.friendId
    const { page, limit } = req.query

    const chat = await ChatService.getOrCreatePrivateChat(userId, friendId)
    const messages = await FriendService.getMessages(userId, friendId, {
      page,
      limit,
    })

    sendResponse(res, 200, true, "Messages retrieved", { messages, chat })
  },
)
