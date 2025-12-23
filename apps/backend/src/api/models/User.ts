import type { CallbackError } from "mongoose"
import type {
  UserSchema as IUserSchema,
  UserDocument,
  UserModel,
} from "../../types/mongoose.gen.js"

import bcrypt from "bcryptjs"
import { differenceInDays, isBefore } from "date-fns"
import mongoose, { Schema } from "mongoose"

import { hashPassword } from "../../utils/hashHelper.js"
import { logger } from "../../utils/winston-logger.js"
import { FileUploadService } from "../services/file-upload-service.js"
import { GeocodingService } from "../services/geocoding-service.js"
import { Activity } from "./Activity.js"
import { Badge } from "./Badge.js"
import { CollaborationGoal } from "./CollaborationGoal.js"
import { FriendRequest } from "./FriendRequest.js"
import { Goal } from "./Goal.js"
import { Group } from "./Group.js"
import { Level } from "./Level.js"
import { Milestone } from "./Milestone.js"
import { Reminder } from "./Reminder.js"

const UserSchema: IUserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8, select: false },
    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    name: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "moderator", "military"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
    isLocked: { type: Boolean, default: false },
    active: { type: Boolean, default: true },

    // Relationships
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reward" }],
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],

    location: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      coordinates: new Schema(
        {
          latitude: { type: Number, required: true },
          longitude: { type: Number, required: true },
        },
        { _id: false },
      ),
    },

    // Enhanced Stripe / Subscriptions
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    subscription_status: {
      type: String,
      enum: ["trial", "active", "expired", "canceled", "past_due"],
      default: "trial",
    },
    subscriptionTier: {
      type: String,
      enum: ["free-trial", "basic", "pro", "elite"],
      default: "free-trial",
    },
    trial_start_date: { type: Date },
    trial_end_date: { type: Date },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    next_billing_date: { type: Date },
    billing_cycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },

    // Communication & Interests
    interests: [{ type: String }],
    chatPreferences: {
      preferredGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
      directMessagesOnly: { type: Boolean, default: false },
    },

    activeStatus: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    // Settings
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "friends", "private"],
          default: "public",
        },
      },
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
)

// Indexes
UserSchema.index({ interests: 1 })
UserSchema.index({ activeStatus: 1 })
UserSchema.index({ "location.city": 1 })
UserSchema.index({ "location.country": 1 })
UserSchema.index({ active: 1 })
UserSchema.index({ stripeCustomerId: 1 })
UserSchema.index({ stripeSubscriptionId: 1 })
UserSchema.index({ subscriptionTier: 1 })
UserSchema.index({ subscription_status: 1 })
UserSchema.index({ trial_end_date: 1 })

// Password hashing
UserSchema.pre(
  "save",
  async function (this, next: (err?: CallbackError) => void): Promise<void> {
    if (!this.isModified("password") || this.password.startsWith("$2")) {
      return next()
    }
    try {
      this.password = await hashPassword(this.password)
      next()
    } catch (err) {
      next(err as CallbackError)
    }
  },
)

async function cleanUp(userId: string) {
  try {
    await Level.deleteOne({ user: userId })
    await Goal.deleteMany({ user: userId })
    await Milestone.deleteMany({ user: userId })
    await Reminder.deleteMany({ user: userId })
    await Activity.deleteMany({ user: userId })
    await FriendRequest.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }],
    })
    await mongoose.model("GroupInvitation").deleteMany({
      $or: [{ sender: userId }, { recipient: userId }],
    })
    await CollaborationGoal.find({ participants: userId }).then(
      (collaborationGoals) => {
        collaborationGoals.forEach((goal) => {
          goal.participants.remove(userId)
          goal.save()
        })
      },
    )
    
    // This might be failing - wrap in its own try-catch
    try {
      await FileUploadService.deleteAllUserFiles(userId)
    } catch (fileError) {
      console.error("Failed to delete user files:", fileError)
      // Continue with deletion even if file cleanup fails
    }
    
    await Badge.deleteMany({ user: userId })
    // remove user from other users' friends
    await mongoose
      .model("User")
      .updateMany({ friends: userId }, { $pull: { friends: userId } })
    // remove user from groups
    await Group.updateMany({ members: userId }, { $pull: { members: userId } })
  } catch (error) {
    console.error("Error during user cleanup:", error)
    // Don't throw - allow deletion to proceed
  }
}

UserSchema.pre("findOneAndDelete", async function (this, next) {
  await cleanUp(this.getQuery()._id.toString())
  next()
})

UserSchema.methods = {
  hasFeatureAccess(feature: string): boolean {
    const featureAccess = {
      "free-trial": ["all"],
      basic: ["streak", "dailyPrompts", "groupChat"],
      pro: [
        "streak",
        "dailyPrompts",
        "groupChat",
        "dmMessaging",
        "badges",
        "analytics",
      ],
      elite: ["all"],
    }

    const tier = this.subscriptionTier
    const userFeatures = featureAccess[tier] ?? featureAccess.basic // default to basic features
    return userFeatures.includes("all") || userFeatures.includes(feature)
  },
  isSubscriptionActive() {
    return (
      this.subscription_status === "active" ||
      this.subscription_status === "trial" ||
      (this.subscription_status === "canceled" &&
        isBefore(new Date(), this.subscriptionEndDate))
    )
  },
  isInTrial() {
    if (this.subscription_status === "trial" && this.trial_end_date) {
      return isBefore(new Date(), this.trial_end_date)
    }
    return false
  },
  getDaysUntilTrialEnd() {
    if (!this.trial_end_date) {
      return 0
    }
    const today = new Date()
    const daysRemaining = differenceInDays(this.trial_end_date, today)
    return Math.max(0, daysRemaining)
  },
  async comparePassword(candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.password)
  },
  async awardBadge(badgeId: mongoose.Types.ObjectId) {
    if (!this.badges.includes(badgeId)) {
      this.badges.push(badgeId)
      await this.save()
    }
  },
  getGoalLimit(): number {
    const tier = this.subscriptionTier

    const limits = {
      "free-trial": -1, // Unlimited
      basic: 3,
      pro: -1, // Unlimited
      elite: -1, // Unlimited
    }

    return limits[tier]
  },
  async getTimezone() {
    if (
      this.location.coordinates?.latitude &&
      this.location.coordinates?.longitude
    ) {
      try {
        return await GeocodingService.getTimezoneFromCoordinates(
          this.location.coordinates.latitude,
          this.location.coordinates.longitude,
        )
      } catch (error) {
        logger.error(
          `Error fetching timezone: ${(error as Error).message}`,
          error,
        )
        return "UTC"
      }
    }

    return "UTC"
  },
  setOnline() {
    this.activeStatus = "online"
    return this.save()
  },
  setOffline() {
    this.activeStatus = "offline"
    return this.save()
  },
}

export const User: UserModel = mongoose.model<UserDocument, UserModel>(
  "User",
  UserSchema,
)
