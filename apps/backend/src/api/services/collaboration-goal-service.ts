import { Types } from "mongoose"

import { CollaborationGoal } from "../models/CollaborationGoal"

class CollaborationGoalService {
  /**
   * Create a new collaboration goal.
   */
  static async create(
    creatorId: string,
    title: string,
    description: string,
    participantIds: string[],
  ) {
    const creatorObj = new Types.ObjectId(creatorId)
    const unique = Array.from(new Set([creatorId, ...participantIds]))
    const participants = unique.map((id) => new Types.ObjectId(id))

    const goal = new CollaborationGoal({
      title,
      description,
      createdBy: creatorObj,
      participants,
    })

    return goal.save()
  }

  /**
   * Fetch all goals in which the given user participates.
   */
  static async getForUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID")
    }

    return CollaborationGoal.find({
      participants: new Types.ObjectId(userId),
    })
      .populate("createdBy", "username")
      .populate("participants", "username")
      .exec()
  }

  static async countForUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID")
    }
    return CollaborationGoal.countDocuments({
      participants: new Types.ObjectId(userId),
    })
  }

  /**
   * Delete a collaboration goal, verifying that `userId` is its creator.
   */
  static async delete(goalId: string, userId: string): Promise<void> {
    const goal = await CollaborationGoal.findById(goalId).exec()
    if (!goal) {
      const err = new Error("Goal not found")
      ;(err as any).status = 404
      throw err
    }
    if (goal.createdBy.toString() !== userId) {
      const err = new Error("Not authorized to delete this goal")
      ;(err as any).status = 403
      throw err
    }
    await CollaborationGoal.deleteOne({ _id: goalId }).exec()
  }

  /**
   * Add one participant to a goal, verifying that `userId` is the creator.
   */
  static async addParticipant(
    goalId: string,
    actorUserId: string,
    newParticipantId: string,
  ) {
    const goal = await CollaborationGoal.findById(goalId).exec()
    if (!goal) {
      const err = new Error("Goal not found")
      ;(err as any).status = 404
      throw err
    }
    if (goal.createdBy.toString() !== actorUserId) {
      const err = new Error("Not authorized to add participants to this goal")
      ;(err as any).status = 403
      throw err
    }

    if (!goal.participants.some((p) => p.toString() === newParticipantId)) {
      goal.participants.push(new Types.ObjectId(newParticipantId))
      await goal.save()
    }
    return goal
  }
}

export default CollaborationGoalService
