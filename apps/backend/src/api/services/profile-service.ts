import type { UpdateProfileData } from "../routes/profile"

import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"
import { GeocodingService } from "./geocoding-service"

export class ProfileService {
  /**
   * Update any of the allowed profile fields.
   */
  static async updateProfile(userId: string, updates: UpdateProfileData) {
    if (Object.keys(updates).length === 0) {
      throw createError("No updatable fields provided", 400)
    }

    if ("location" in updates && !updates.location.coordinates) {
      const coordinates = await GeocodingService.geocode(
        updates.location.city,
        updates.location.state,
        updates.location.country,
      )
      updates.location.coordinates = coordinates
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
