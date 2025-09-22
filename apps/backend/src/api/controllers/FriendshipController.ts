// src/api/controllers/FriendshipController.ts
import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"
import type { OnlineFriendsQuery } from "../routes/friends"

import FriendService from "../services/FriendService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export default {
  sendFriendRequest: catchAsync(
    async (
      req: AuthenticatedRequest<unknown, unknown, { recipientId: string }>,
      res: Response,
    ) => {
      const userId = req.user.id
      const recipientId = req.body.recipientId

      await FriendService.sendRequest(userId, recipientId)
      sendResponse(res, 201, true, "Friend request sent")
    },
  ),

  acceptFriendRequest: catchAsync(
    async (
      req: AuthenticatedRequest<any, { requestId: string }>,
      res: Response,
      next: NextFunction,
    ) => {
      const me = req.user!.id
      const id = req.body.requestId

      try {
        await FriendService.acceptRequest(id, me)
        sendResponse(res, 200, true, "Friend request accepted")
      } catch (err) {
        return next(err)
      }
    },
  ),

  rejectFriendRequest: catchAsync(
    async (
      req: AuthenticatedRequest<{ requestId: string }>,
      res: Response,
      next: NextFunction,
    ) => {
      const me = req.user!.id
      const id = req.params.requestId

      try {
        await FriendService.rejectRequest(id, me)
        sendResponse(res, 200, true, "Friend request rejected")
      } catch (err) {
        return next(err)
      }
    },
  ),

  cancelFriendRequest: catchAsync(
    async (
      req: AuthenticatedRequest<{ requestId: string }>,
      res: Response,
      next: NextFunction,
    ) => {
      const me = req.user!.id
      const id = req.params.requestId

      try {
        await FriendService.cancelRequest(id, me)
        sendResponse(res, 200, true, "Friend request canceled")
      } catch (err) {
        return next(err)
      }
    },
  ),

  removeFriend: catchAsync(
    async (
      req: AuthenticatedRequest<{ friendId: string }>,
      res: Response,
      next: NextFunction,
    ) => {
      const me = req.user!.id
      const them = req.params.friendId

      try {
        await FriendService.removeFriend(me, them)
        sendResponse(res, 200, true, "Friend removed")
      } catch (err) {
        return next(err)
      }
    },
  ),

  getFriendsList: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user.id

      const list = await FriendService.listFriends(userId)
      sendResponse(res, 200, true, "Friends list", { friends: list })
    },
  ),

  getPendingFriendRequests: catchAsync(async (_req, res, next) => {
    const me = _req.user!.id
    try {
      const list = await FriendService.pendingRequests(me)
      sendResponse(res, 200, true, "Pending requests", { requests: list })
    } catch (err) {
      return next(err)
    }
  }),

  getAIRecommendedFriends: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user.id

      const recs = await FriendService.aiRecommendations(userId)

      // Make sure this matches what your frontend expects
      sendResponse(res, 200, true, "Recommendations", {
        recommendedFriends: recs,
      })
    },
  ),

  getOnlineFriends: catchAsync(
    async (
      req: AuthenticatedRequest<unknown, unknown, unknown, OnlineFriendsQuery>,
      res: Response,
    ) => {
      const userId = req.user.id
      const limit = req.query.limit

      const friends = await FriendService.listFriends(userId)

      const onlineFriends = friends
        .filter((friend) => friend.activeStatus === "online")
        .slice(0, limit)

      sendResponse(res, 200, true, "Online friends fetched successfully", {
        friends: onlineFriends,
        count: onlineFriends.length,
      })
    },
  ),
}
