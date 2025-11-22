import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"

import { UserService } from "../services/user-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

export const getMemberInfo = catchAsync(
  async (req: AuthenticatedRequest<{ username: string }>, res: Response) => {
    const member = await UserService.getMemberByUsername(
      req.params.username,
      req.user.id,
    )

    sendResponse(res, 200, true, "Member info fetched", { member })
  },
)
