import type { Request, Response } from "express"

import AnonymousMilitaryChatService from "../services/anonymous-military-chat-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export const getRooms = catchAsync(async (_req: Request, res: Response) => {
  const rooms = await AnonymousMilitaryChatService.getRooms()
  sendResponse(res, 200, true, "Military chat rooms retrieved", { rooms })
})

export const getMessages = catchAsync(
  async (
    req: Request<{ roomId: string }, unknown, unknown, { limit?: number }>,
    res: Response,
  ) => {
    const { roomId } = req.params
    const limit = req.query.limit ?? 50

    const messages = await AnonymousMilitaryChatService.getMessages(
      roomId,
      limit,
    )

    sendResponse(res, 200, true, "Messages retrieved", { messages })
  },
)
