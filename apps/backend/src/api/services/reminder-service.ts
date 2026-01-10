import mongoose from "mongoose"

import type { Reminder as IReminder } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import { Goal } from "../models/Goal.js"
import { Reminder } from "../models/Reminder.js"
import { User } from "../models/User.js"
import { sendReminderEmail } from "./email-service.js"

export class ReminderService {
  /**
   * Create a new reminder
   */
  static async createReminder(
    userId: string,
    data: Pick
      IReminder,
      "message" | "goal" | "remindAt" | "recurrence" | "reminderType" | "endRepeat"
    >
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID")
    }

    // If linked to a goal, verify ownership
    if (data.goal) {
      const goal = await Goal.findOne({ _id: data.goal, user: userId })
      if (!goal) {
        throw new Error("Goal not found or not owned by user")
      }
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    const reminder = new Reminder({
      user: userId,
      email: user.email,
      ...data,
    })

    await reminder.save()
    logger.info(`⏰ Reminder created for user ${userId}`)
    return reminder
  }

  /**
   * Get all reminders for a user
   */
  static async getUserReminders(userId: string, includeInactive = false) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID")
    }

    const filter: any = { user: userId }
    if (!includeInactive) {
      filter.isActive = true
    }

    return Reminder.find(filter)
      .populate("goal", "title dueDate progress")
      .sort({ remindAt: 1 })
      .exec()
  }

  /**
   * Get a single reminder by ID
   */
  static async getReminderById(userId: string, reminderId: string) {
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      throw new Error("Invalid reminder ID")
    }

    return Reminder.findOne({ _id: reminderId, user: userId })
      .populate("goal", "title dueDate progress")
      .exec()
  }

  /**
   * Update a reminder
   */
  static async updateReminder(
    userId: string,
    reminderId: string,
    updates: Partial<Pick<IReminder, "message" | "remindAt" | "recurrence" | "reminderType" | "isActive" | "endRepeat">>
  ) {
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      throw new Error("Invalid reminder ID")
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, user: userId },
      { $set: updates },
      { new: true }
    )

    if (!reminder) {
      throw new Error("Reminder not found")
    }

    logger.info(`⏰ Reminder ${reminderId} updated`)
    return reminder
  }

  /**
   * Delete a reminder
   */
  static async deleteReminder(userId: string, reminderId: string) {
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      throw new Error("Invalid reminder ID")
    }

    const result = await Reminder.deleteOne({ _id: reminderId, user: userId })
    return result.deletedCount === 1
  }

  /**
   * Get reminders that need to be sent (for cron job)
   */
  static async getDueReminders() {
    const now = new Date()
    
    return Reminder.find({
      isActive: true,
      isSent: false,
      remindAt: { $lte: now },
    })
      .populate("user", "email username")
      .populate("goal", "title dueDate progress")
      .exec()
  }

  /**
   * Process and send due reminders (called by cron)
   */
  static async processDueReminders() {
    const dueReminders = await this.getDueReminders()
    
    logger.info(`⏰ Processing ${dueReminders.length} due reminders`)

    for (const reminder of dueReminders) {
      try {
        if (reminder.reminderType === "email" && reminder.email) {
          await sendReminderEmail(
            reminder.email,
            reminder.message,
            (reminder.goal as any)?.title
          )
        }

        // Mark as sent
        await reminder.markAsSent()

        // Handle recurrence
        if (reminder.recurrence !== "none") {
          await this.scheduleNextRecurrence(reminder)
        }

        logger.info(`✅ Reminder ${reminder._id} sent successfully`)
      } catch (error) {
        logger.error(`❌ Failed to send reminder ${reminder._id}:`, error)
      }
    }

    return dueReminders.length
  }

  /**
   * Schedule the next occurrence of a recurring reminder
   */
  static async scheduleNextRecurrence(reminder: IReminder) {
    const nextDate = new Date(reminder.remindAt)

    switch (reminder.recurrence) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1)
        break
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      default:
        return
    }

    // Check if next occurrence is before end date
    if (reminder.endRepeat && nextDate > reminder.endRepeat) {
      logger.info(`⏰ Recurring reminder ${reminder._id} has ended`)
      return
    }

    // Create next reminder
    await Reminder.create({
      user: reminder.user,
      message: reminder.message,
      goal: reminder.goal,
      remindAt: nextDate,
      recurrence: reminder.recurrence,
      reminderType: reminder.reminderType,
      email: reminder.email,
      endRepeat: reminder.endRepeat,
    })

    logger.info(`⏰ Next recurrence scheduled for ${nextDate}`)
  }

  /**
   * Create automatic reminders for a goal based on due date
   */
  static async createGoalReminders(userId: string, goalId: string) {
    const goal = await Goal.findOne({ _id: goalId, user: userId })
    if (!goal || !goal.dueDate) return []

    const user = await User.findById(userId)
    if (!user) return []

    const reminders = []
    const dueDate = new Date(goal.dueDate)
    const now = new Date()

    // 1 day before
    const oneDayBefore = new Date(dueDate)
    oneDayBefore.setDate(oneDayBefore.getDate() - 1)
    if (oneDayBefore > now) {
      reminders.push(
        await Reminder.create({
          user: userId,
          goal: goalId,
          message: `⏰ "${goal.title}" is due tomorrow!`,
          remindAt: oneDayBefore,
          reminderType: "email",
          email: user.email,
        })
      )
    }

    // 3 days before
    const threeDaysBefore = new Date(dueDate)
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3)
    if (threeDaysBefore > now) {
      reminders.push(
        await Reminder.create({
          user: userId,
          goal: goalId,
          message: `📅 "${goal.title}" is due in 3 days`,
          remindAt: threeDaysBefore,
          reminderType: "email",
          email: user.email,
        })
      )
    }

    logger.info(`⏰ Created ${reminders.length} auto-reminders for goal ${goalId}`)
    return reminders
  }
}