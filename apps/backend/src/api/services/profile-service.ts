import type { UpdateProfileData } from "../routes/profile"

import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"
import { FileUploadService } from "./file-upload-service"

export class ProfileService {
  /**
   * Update any of the allowed profile fields.
   */
  static async updateProfile(userId: string, updates: UpdateProfileData) {
    if (Object.keys(updates).length === 0) {
      throw createError("No updatable fields provided", 400)
    }

    await User.findByIdAndUpdate(userId, updates).exec()
  }

  /**
   * Handle avatar uploads. Expects `file` to be a Multer File.
   */
  static async uploadProfileImage(userId: string, key: string) {
    const old = await User.findByIdAndUpdate(userId, {
      profileImage: key,
    }).exec()
    await FileUploadService.deleteFromS3(old?.profileImage || "") // delete old if exists
  }

  static async uploadCoverImage(userId: string, key: string) {
    const old = await User.findByIdAndUpdate(userId, { coverImage: key }).exec()
    await FileUploadService.deleteFromS3(old?.coverImage || "") // delete old if exists
  }
}
