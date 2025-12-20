import type { Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"

import { UserService } from "../services/user-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export const getMemberInfo = catchAsync(
  async (req: AuthenticatedRequest<{ username: string }>, res: Response) => {
    const member = await UserService.getMemberByUsername(
      req.params.username,
      req.user.id,
    )

    sendResponse(res, 200, true, "Member info fetched", { member })
  },
)

export const getAllUsers = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const search = (req.query.search as string) || ""

    const result = await UserService.getAllUsers(page, limit, search)

    sendResponse(res, 200, true, "All users fetched", result)
  },
)

export const deleteUser = catchAsync(
  async (req: AuthenticatedRequest<{ id: string }>, res: Response) => {
    await UserService.deleteUser(req.params.id)

    sendResponse(res, 200, true, "User deleted successfully")
  },
)

export const createUser = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await UserService.createUser(req.body)

    sendResponse(res, 201, true, "User created successfully", { user })
  },
)
