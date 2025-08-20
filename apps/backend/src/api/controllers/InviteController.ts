import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"

import InviteService from "../services/InviteService"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export const sendGroupInvitation = catchAsync(
  async (
    req: AuthenticatedRequest<
      { groupId: string },
      any,
      { recipientId: string }
    >,
    res: Response,
  ) => {
    const senderId = req.user!.id
    const { groupId } = req.params
    const { recipientId } = req.body

    const invitation = await InviteService.sendInvitation(
      senderId,
      recipientId,
      groupId,
    )

    sendResponse(res, 201, true, "Invitation sent successfully", {
      invitation,
    })
  },
)

export const acceptGroupInvitation = catchAsync(
  async (
    req: AuthenticatedRequest<any, any, { invitationId: string }>,
    res: Response,
  ) => {
    const userId = req.user!.id
    const { invitationId } = req.body

    await InviteService.acceptInvitation(userId, invitationId)
    sendResponse(res, 200, true, "Invitation accepted successfully")
  },
)

export const rejectGroupInvitation = catchAsync(
  async (
    req: AuthenticatedRequest<any, any, { invitationId: string }>,
    res: Response,
  ) => {
    const userId = req.user!.id
    const { invitationId } = req.body

    await InviteService.rejectInvitation(userId, invitationId)
    sendResponse(res, 200, true, "Invitation rejected successfully")
  },
)

export const cancelGroupInvitation = catchAsync(
  async (
    req: AuthenticatedRequest<any, any, { invitationId: string }>,
    res: Response,
  ) => {
    const senderId = req.user!.id
    const { invitationId } = req.body

    await InviteService.cancelInvitation(senderId, invitationId)
    sendResponse(res, 200, true, "Invitation canceled successfully")
  },
)

export default {
  sendGroupInvitation,
  acceptGroupInvitation,
  rejectGroupInvitation,
  cancelGroupInvitation,
}
