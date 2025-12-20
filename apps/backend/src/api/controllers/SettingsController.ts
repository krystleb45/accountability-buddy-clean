import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type {
  PasswordUpdateInput,
  SettingsUpdateInput,
} from "../routes/settings.js"

import SettingsService from "../services/SettingsService.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export const getUserSettings = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const settings = await SettingsService.getSettings(req.user.id)

    sendResponse(res, 200, true, "User settings fetched successfully", {
      settings,
    })
  },
)

export const updateUserSettings = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, SettingsUpdateInput>,
    res: Response,
  ) => {
    const settings = await SettingsService.updateSettings(req.user.id, req.body)

    sendResponse(res, 200, true, "Account settings updated successfully", {
      settings,
    })
  },
)

export const updateUserPassword = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, PasswordUpdateInput>,
    res: Response,
  ) => {
    const { currentPassword, newPassword } = req.body
    await SettingsService.updatePassword(
      req.user.id,
      currentPassword,
      newPassword,
    )
    sendResponse(res, 200, true, "Password updated successfully")
  },
)

export const deleteUserAccount = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await SettingsService.deleteAccount(req.user.id)
    sendResponse(res, 200, true, "Account deleted successfully")
  },
)
