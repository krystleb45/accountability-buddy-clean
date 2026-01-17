import type { SettingsUpdateInput } from "../routes/settings.js"

import { comparePassword } from "../../utils/hashHelper.js"
import { createError } from "../middleware/errorHandler.js"
import { User } from "../models/User.js"

class SettingsService {
  /**
   * Fetch a user's settings (including phone number for SMS).
   */
  static async getSettings(userId: string) {
    const user = await User.findById(userId)
      .select("settings phoneNumber")
      .lean()

    if (!user) {
      throw createError("User not found", 404)
    }

    return {
      settings: user.settings,
      phoneNumber: user.phoneNumber || "",
    }
  }

  /**
   * Update general account settings (including phone number).
   */
  static async updateSettings(userId: string, updates: SettingsUpdateInput & { phoneNumber?: string }) {
    const updateFields: Record<string, any> = {}

    // Handle notifications settings
    if (updates.notifications) {
      updateFields["settings.notifications"] = updates.notifications
    }

    // Handle privacy settings
    if (updates.privacy) {
      updateFields["settings.privacy"] = updates.privacy
    }

    // Handle phone number update
    if (updates.phoneNumber !== undefined) {
      // Clean phone number - remove formatting, keep only digits
      const cleanedPhone = updates.phoneNumber.replace(/\D/g, "")
      
      // Add +1 prefix for US numbers if not already present
      if (cleanedPhone.length === 10) {
        updateFields.phoneNumber = `+1${cleanedPhone}`
      } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith("1")) {
        updateFields.phoneNumber = `+${cleanedPhone}`
      } else if (cleanedPhone.length === 0) {
        updateFields.phoneNumber = ""
      } else {
        updateFields.phoneNumber = cleanedPhone
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
        context: "query",
      },
    ).select("settings phoneNumber")

    if (!user) {
      throw createError("User not found", 404)
    }

    return {
      settings: user.settings,
      phoneNumber: user.phoneNumber || "",
    }
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
