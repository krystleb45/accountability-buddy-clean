import type {
  ChallengeDocument,
  ChallengeModel,
  ChallengeSchema as IChallengeSchema,
  RewardObject,
} from "src/types/mongoose.gen"

import { isAfter } from "date-fns"
import mongoose, { Schema } from "mongoose"

import { Milestone } from "./Milestone"
import { Reward } from "./Reward"
import { User } from "./User"

// --- Schema Definitions ---
const ParticipantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    progress: { type: Number, default: 0, min: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

const ChallengeSchema: IChallengeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    goal: { type: String, required: true, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    creator: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
      required: true,
    },
    participants: { type: [ParticipantSchema], default: [] },
    rewards: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: Reward.modelName,
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "canceled"],
      default: "ongoing",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    progressTracking: {
      type: String,
      enum: ["individual", "team", "both"],
      default: "individual",
    },
    milestones: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: Milestone.modelName,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// --- Compound Index  ---
ChallengeSchema.index({
  title: 1,
  creator: 1,
  status: 1,
  visibility: 1,
  startDate: 1,
  endDate: 1,
})

// --- Instance Methods ---
ChallengeSchema.methods = {
  async addReward(this, rewardType: RewardObject, rewardValue: string) {
    this.rewards.push({ rewardType, rewardValue })
    await this.save()
    return this
  },
  async addMilestone(this, milestoneTitle: string, dueDate: Date) {
    const milestone = await Milestone.create({
      title: milestoneTitle,
      dueDate,
      completed: false,
      achievedBy: [],
    })
    this.milestones.push(milestone)
    await this.save()
    return milestone
  },
}

// --- Static Methods ---
ChallengeSchema.statics = {
  async addParticipant(
    challengeId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ) {
    const challenge = await this.findById(challengeId)
    if (!challenge) {
      throw new Error("Challenge not found")
    }
    if (!challenge.participants.some((p) => p.user._id.equals(userId))) {
      challenge.participants.push({
        user: userId,
        progress: 0,
        joinedAt: new Date(),
      } as any)
      await challenge.save()
    }
    return challenge
  },
  async updateProgress(
    challengeId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    progressUpdate: number,
  ) {
    const challenge = await this.findById(challengeId)
    if (!challenge) {
      throw new Error("Challenge not found")
    }
    const participant = challenge.participants.find((p) =>
      p.user._id.equals(userId),
    )
    if (!participant) {
      throw new Error("Participant not found")
    }
    participant.progress += progressUpdate
    await challenge.save()
    return challenge
  },
  async updateMilestoneStatus(
    challengeId: mongoose.Types.ObjectId,
    milestoneId: mongoose.Types.ObjectId,
  ) {
    const milestone = await Milestone.findById(milestoneId)
    if (!milestone) {
      throw new Error("Milestone not found")
    }
    milestone.completed = true
    await milestone.save()
  },
  async fetchChallengesWithPagination(
    page: number,
    pageSize: number,
    filters: Record<string, any> = {},
  ) {
    const skip = (page - 1) * pageSize
    return this.find(filters)
      .skip(skip)
      .limit(pageSize)
      .populate("creator", "username profilePicture")
      .populate("participants.user", "username profilePicture")
      .sort({ createdAt: -1 })
  },
}

// --- Pre-save Hook ---
ChallengeSchema.pre("save", function (next) {
  if (isAfter(new Date(), this.endDate) && this.status === "ongoing") {
    this.status = "completed"
  }
  next()
})

// --- Virtuals ---
ChallengeSchema.virtual("participantCount").get(function (this) {
  return this.participants.length
})
ChallengeSchema.virtual("isActive").get(function (this) {
  return this.status === "ongoing"
})

// --- Model Export ---
export const Challenge: ChallengeModel = mongoose.model<
  ChallengeDocument,
  ChallengeModel
>("Challenge", ChallengeSchema)
