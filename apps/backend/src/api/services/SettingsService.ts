import type { SettingsUpdateInput } from "../routes/settings"

import { comparePassword } from "../../utils/hashHelper"
import { createError } from "../middleware/errorHandler"
import { User } from "../models/User"

class SettingsService {
  /**
   * Fetch a user's settings.
   */
  static async getSettings(userId: string) {
    const user = await User.findById(userId).select("settings").lean()

    if (!user) {
      throw createError("User not found", 404)
    }

    return user.settings
  }

  /**
   * Update general account settings.
   */
  static async updateSettings(userId: string, updates: SettingsUpdateInput) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(updates.notifications
          ? { "settings.notifications": updates.notifications }
          : {}),
        ...(updates.privacy ? { "settings.privacy": updates.privacy } : {}),
      },
      {
        new: true,
        runValidators: true,
        context: "query",
      },
    ).select("settings")

    if (!user) {
      throw createError("User not found", 404)
    }

    return user.settings
  }

  /**
   * Change a user's password, verifying the current one.
   */
  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await User.findById(userId).select("+password")
    if (!user) {
      throw createError("User not found", 404)
    }

    const match = await comparePassword(currentPassword, user.password!)
    if (!match) {
      throw createError("Incorrect current password", 400)
    }

    user.password = newPassword
    await user.save() // pre-save hook will hash the password
  }

  /**
   * Delete a user account.
   */
  static async deleteAccount(userId: string): Promise<void> {
    const deleted = await User.findByIdAndDelete(userId)
    if (!deleted) {
      throw createError("User not found", 404)
    }
  }
}

export default SettingsService
