import type { UpdateProfileData } from "../routes/profile"

import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"

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
    await User.findByIdAndUpdate(userId, { profileImage: key }).exec()
  }

  static async uploadCoverImage(userId: string, key: string) {
    await User.findByIdAndUpdate(userId, { coverImage: key }).exec()
  }
}
