import type { Types } from "mongoose"

import type { IUser } from "../models/User"

import { createError } from "../middleware/errorHandler"
import Reward from "../models/Reward" // Correct import for the Reward model
import { User } from "../models/User" // Ensure the correct import for User model
// …
export async function addPoints(
  userId: string,
  points: number,
): Promise<IUser> {
  if (points <= 0) throw createError("Points must be a positive number", 400)
  const user = await User.findById(userId)
  if (!user) throw createError("User not found", 404)
  user.points = (user.points ?? 0) + points
  await user.save()
  return user
}

// 🟢 Service to subtract points from a user
export async function subtractPoints(
  userId: string,
  points: number,
): Promise<IUser> {
  if (points <= 0) {
    throw new Error("Points must be a positive number.")
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User not found.")
  }

  if ((user.points ?? 0) < points) {
    throw new Error("Insufficient points.")
  }

  user.points = (user.points ?? 0) - points
  await user.save()

  // Return the updated user document
  return user // Return the Mongoose document
}

// 🟢 Service to get a user's points
export async function getUserPoints(userId: string): Promise<number> {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User not found.")
  }
  return user.points ?? 0
}

// 🟢 Service to redeem points for rewards
export async function redeemPoints(
  userId: string,
  rewardId: string,
): Promise<{ message: string; reward: any; userPoints: number }> {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User not found.")
  }

  const reward = await Reward.findById(rewardId)
  if (!reward) {
    throw new Error("Reward not found.")
  }

  if ((user.points ?? 0) < reward.pointsRequired) {
    throw new Error("Insufficient points to redeem this reward.")
  }

  user.points = (user.points ?? 0) - reward.pointsRequired // Use default value of 0 if undefined
  user.rewards.push(reward._id as Types.ObjectId) // Add reward to user's rewards list
  await user.save()

  return {
    message: "Reward redeemed successfully.",
    reward,
    userPoints: user.points,
  }
}
