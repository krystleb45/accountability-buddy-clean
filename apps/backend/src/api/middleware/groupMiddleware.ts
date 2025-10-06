import type { NextFunction, Request, Response } from "express"
import type { Group as IGroup } from "src/types/mongoose.gen"

import mongoose from "mongoose"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type"

import { Group } from "../models/Group"
import catchAsync from "../utils/catchAsync"
import { CustomError } from "./errorHandler"

// Extend Request interface to include group data
declare module "express" {
  interface Request {
    isGroupMember?: boolean
    isGroupAdmin?: boolean
  }
}

/**
 * Check if user is a member of the group
 */
export const checkGroupMembership = catchAsync(
  async (
    req: AuthenticatedRequest<{ groupId: string }>,
    _res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user.id
    const groupId = req.params.groupId
    const group = await Group.findById(groupId)

    if (!group) {
      throw new CustomError("Group not found", 404)
    }

    const userObjectId = new mongoose.Types.ObjectId(userId)
    const isMember = group.members.some((member) =>
      member._id.equals(userObjectId),
    )

    if (!isMember) {
      throw new CustomError("Access denied. Not a group member.", 403)
    }

    // Attach membership status to request
    req.isGroupMember = true
    next()
  },
)

/**
 * Check if user is an admin of the group
 */
export const checkGroupAdmin = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id
    const group = req.group
    const userRole = req.user.role

    const userObjectId = new mongoose.Types.ObjectId(userId)

    // Check if user is the group creator (admin)
    const isGroupCreator = group.createdBy._id.equals(userObjectId)

    // Check if user is a system admin
    const isSystemAdmin = userRole === "admin"

    if (!isGroupCreator && !isSystemAdmin) {
      throw new CustomError("Admin access required", 403)
    }

    // Attach admin status to request
    req.isGroupAdmin = true
    next()
  },
)

/**
 * Check if group is public or user has access to private group
 */
export const checkGroupAccess = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const group = req.group

    if (!group) {
      res.status(500).json({
        success: false,
        message:
          "Group data not found. Make sure checkGroupExists middleware runs first.",
      })
      return
    }

    // Public groups are accessible to everyone
    if (group.isPublic) {
      next()
      return
    }

    // Private groups require membership
    const userObjectId = new mongoose.Types.ObjectId(userId)
    const isMember = group.members.some((member: any) =>
      member._id.equals(userObjectId),
    )

    if (!isMember) {
      res.status(403).json({
        success: false,
        message: "Access denied. This is a private group.",
      })
      return
    }

    next()
  },
)

export default {
  checkGroupMembership,
  checkGroupAdmin,
  checkGroupAccess,
}
