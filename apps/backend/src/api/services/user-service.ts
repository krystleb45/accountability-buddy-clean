import type { User as IUser } from "src/types/mongoose.gen"

import { CustomError } from "../middleware/errorHandler"
import { User } from "../models/User"
import { FileUploadService } from "./file-upload-service"

export class UserService {
  static async getMemberByUsername(username: string, currentUserId: string) {
    const publicFields: (keyof IUser)[] = [
      "_id",
      "username",
      "profileImage",
      "name",
      "bio",
      "location",
      "coverImage",
      "friends",
      "interests",
      "settings",
      "activeStatus",
    ]
    const user = await User.findOne({ username })
      .select(publicFields.join(" "))
      .populate("friends", "username profileImage name") // Populate friends with limited fields

    if (!user) {
      throw new CustomError("User not found", 404)
    }

    if (user.settings.privacy.profileVisibility === "private") {
      // return only basic public info
      return {
        _id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        name: user.name,
        privacy: user.settings.privacy.profileVisibility,
      }
    }

    if (
      user.settings.privacy.profileVisibility === "friends" &&
      !user.friends.some((friend) => friend._id.toString() === currentUserId)
    ) {
      // return only basic public info
      return {
        _id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        name: user.name,
        privacy: user.settings.privacy.profileVisibility,
      }
    }

    const userData: IUser & {
      timezone: string
      privacy: IUser["settings"]["privacy"]["profileVisibility"]
      friends: Pick<IUser, "_id" | "username" | "profileImage" | "name">[]
    } = user.toObject()
    delete userData.settings // Remove settings from the response
    userData.timezone = await user.getTimezone()
    userData.privacy = "public"

    if (user.profileImage) {
      userData.profileImage = await FileUploadService.generateSignedUrl(
        user.profileImage,
      )
    }

    if (user.coverImage) {
      userData.coverImage = await FileUploadService.generateSignedUrl(
        user.coverImage,
      )
    }

    if (userData.friends.length > 0) {
      for (const friend of userData.friends) {
        if (friend.profileImage) {
          friend.profileImage = await FileUploadService.generateSignedUrl(
            friend.profileImage,
          )
        }
      }
    }

    return userData
  }

  static async canSendMessage(
    senderId: string,
    recipientId: string,
  ): Promise<boolean> {
    const sender = await User.findById(senderId)
    const recipient = await User.findById(recipientId)

    if (!sender || !recipient) {
      throw new CustomError("User not found", 404)
    }

    // Check if both users have DM messaging enabled
    if (
      !sender.hasFeatureAccess("dmMessaging") ||
      !recipient.hasFeatureAccess("dmMessaging")
    ) {
      return false
    }

    return true
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password")
    if (!user) {
      throw new CustomError("User not found", 404)
    }
    return user
  }
}
