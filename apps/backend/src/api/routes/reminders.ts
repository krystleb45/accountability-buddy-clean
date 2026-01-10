import { Router } from "express"
import z from "zod"

import * as reminderController from "../controllers/reminder-controller.js"
import { protect } from "../middleware/auth-middleware.js"
import { validateSubscription } from "../middleware/subscription-validation.js"
import validate from "../middleware/validation-middleware.js"

const router = Router()

router.use(protect)

const createReminderSchema = z.object({
  message: z.string().min(1, "Message is required").max(255),
  goalId: z.string().optional(),
  remindAt: z.string().datetime("Invalid date format"),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
  reminderType: z.enum(["email", "sms", "app"]).default("email"),
  endRepeat: z.string().datetime().optional(),
})

const updateReminderSchema = z.object({
  message: z.string().min(1).max(255).optional(),
  remindAt: z.string().datetime().optional(),
  recurrence: z.enum(["none", "daily", "weekly", "monthly"]).optional(),
  reminderType: z.enum(["email", "sms", "app"]).optional(),
  isActive: z.boolean().optional(),
  endRepeat: z.string().datetime().optional(),
})

/**
 * GET /api/reminders
 * Get all reminders for the current user
 */
router.get("/", validateSubscription, reminderController.getUserReminders)

/**
 * POST /api/reminders
 * Create a new reminder
 */
router.post(
  "/",
  validateSubscription,
  validate({ bodySchema: createReminderSchema }),
  reminderController.createReminder
)

/**
 * GET /api/reminders/:reminderId
 * Get a specific reminder
 */
router.get(
  "/:reminderId",
  validateSubscription,
  reminderController.getReminderById
)

/**
 * PATCH /api/reminders/:reminderId
 * Update a reminder
 */
router.patch(
  "/:reminderId",
  validateSubscription,
  validate({ bodySchema: updateReminderSchema }),
  reminderController.updateReminder
)

/**
 * DELETE /api/reminders/:reminderId
 * Delete a reminder
 */
router.delete(
  "/:reminderId",
  validateSubscription,
  reminderController.deleteReminder
)

export default router