import type { CallbackError } from "mongoose"
import type {
  UserSchema as IUserSchema,
  UserDocument,
  UserModel,
} from "src/types/mongoose.gen"

import bcrypt from "bcryptjs"
import { addDays, differenceInDays, isBefore } from "date-fns"
import mongoose, { Schema } from "mongoose"

import { Activity } from "./Activity"
import { CollaborationGoal } from "./CollaborationGoal"
import { Goal } from "./Goal"
import { Level } from "./Level"
import { Milestone } from "./Milestone"
import { Reminder } from "./Reminder"

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
    isAdmin: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
    isLocked: { type: Boolean, default: false },
    active: { type: Boolean, default: true },

    // Relationships
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reward" }],
    achievements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
    ],
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
    pinnedGoals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goal" }],
    featuredAchievements: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Achievement" },
    ],

    location: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      timezone: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },

    preferences: {
      language: { type: String, default: "en" },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
      publicProfile: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: false },
      showGoals: { type: Boolean, default: true },
      showInterests: { type: Boolean, default: true },
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
    trial_start_date: { type: Date, default: Date.now },
    trial_end_date: {
      type: Date,
      default: () => addDays(new Date(), 14), // 14 days from now
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    next_billing_date: { type: Date },
    billing_cycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    plan_change_at_period_end: {
      newPlan: {
        type: String,
        enum: ["free-trial", "basic", "pro", "elite"],
      },
      newBillingCycle: {
        type: String,
        enum: ["monthly", "yearly"],
      },
      changeDate: { type: Date },
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
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
        enableNotifications: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "friends", "private"],
          default: "public",
        },
        searchVisibility: { type: Boolean, default: true },
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

// Virtual fields
UserSchema.virtual("profilePicture").get(function () {
  return this.profileImage || "/default-avatar.png"
})

UserSchema.virtual("profilePicture").set(function (value: string) {
  this.profileImage = value
})

UserSchema.virtual("isActive").get(function () {
  return this.active
})

UserSchema.virtual("isActive").set(function (value: boolean) {
  this.active = value
})

// Password hashing
UserSchema.pre(
  "save",
  async function (this, next: (err?: CallbackError) => void): Promise<void> {
    if (!this.isModified("password") || this.password.startsWith("$2")) {
      return next()
    }
    try {
      const rounds = Number.parseInt(process.env.SALT_ROUNDS ?? "10", 10)
      this.password = await bcrypt.hash(this.password, rounds)
      next()
    } catch (err) {
      next(err as CallbackError)
    }
  },
)

async function cleanUp(userId: mongoose.Types.ObjectId) {
  await Level.deleteOne({ user: userId })
  await Goal.deleteMany({ user: userId })
  await Milestone.deleteMany({ user: userId })
  await Reminder.deleteMany({ user: userId })
  await Activity.deleteMany({ user: userId })
  await CollaborationGoal.find({ participants: userId }).then(
    (collaborationGoals) => {
      collaborationGoals.forEach((goal) => {
        goal.participants.remove(userId)
        goal.save()
      })
    },
  )
}

UserSchema.pre("findOneAndDelete", async function (this, next) {
  await cleanUp(this.getQuery()._id)
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
    const userFeatures = featureAccess[tier] ?? [
      "streak",
      "dailyPrompts",
      "groupChat",
    ] // default to basic features
    return userFeatures.includes("all") || userFeatures.includes(feature)
  },
  isSubscriptionActive() {
    return (
      this.subscription_status === "active" ||
      this.subscription_status === "trial"
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
}

export const User: UserModel = mongoose.model<UserDocument, UserModel>(
  "User",
  UserSchema,
)
