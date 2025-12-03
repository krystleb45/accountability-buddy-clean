// src/controllers/ProfileController.ts
import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { UpdateProfileData } from "../routes/profile.js"

import { createError } from "../middleware/errorHandler.js"
import { FileUploadService } from "../services/file-upload-service.js"
import { ProfileService } from "../services/profile-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

/**
 * PUT /api/profile
 */
export const updateProfile = catchAsync(
  async (
    req: AuthenticatedRequest<unknown, unknown, UpdateProfileData>,
    res: Response,
  ): Promise<void> => {
    await ProfileService.updateProfile(req.user.id, req.body)
    sendResponse(res, 200, true, "Profile updated successfully")
  },
)

/**
 * PUT /api/profile/image
 * multipart/form-data with field name "profileImage"
 */
export const uploadProfileImage = catchAsync(
  async (
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction,
  ): Promise<void> => {
    if (!req.file) {
      throw createError("No file (profileImage) uploaded", 400)
    }

    const fileNameToSave = `${req.user.id}-avatar`
    const { key } = await FileUploadService.uploadToS3({
      buffer: req.file.buffer,
      name: fileNameToSave,
      mimetype: req.file.mimetype,
    })

    await ProfileService.uploadProfileImage(req.user.id, key)
    sendResponse(res, 200, true, "Avatar updated successfully")
  },
)

/**
 * PUT /api/profile/cover
 * multipart/form-data with field name "coverImage"
 */
export const uploadCoverImage = catchAsync(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) {
      throw createError("No image uploaded", 400)
    }

    const fileNameToSave = `${req.user.id}-cover`
    const { key } = await FileUploadService.uploadToS3({
      buffer: req.file.buffer,
      name: fileNameToSave,
      mimetype: req.file.mimetype,
    })

    await ProfileService.uploadCoverImage(req.user.id, key)

    sendResponse(res, 200, true, "Cover image updated successfully")
  },
)
