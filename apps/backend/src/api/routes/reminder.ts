// src/api/routes/reminder.ts
import type { NextFunction, Request, Response, Router } from "express"

import express from "express"
import rateLimit from "express-rate-limit"

import { logger } from "../../utils/winston-logger"
import { validateReminder } from "../../validators/reminderValidation"
import {
  createCustomReminder,
  deleteCustomReminder,
  disableCustomReminder,
  getCustomReminders,
  updateCustomReminder,
} from "../controllers/ReminderController"
import { protect } from "../middleware/auth-middleware"
import checkSubscription from "../middleware/checkSubscription"

const router: Router = express.Router()

const reminderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many reminder requests; please try again later.",
  },
})

router.post(
  "/",
  protect,
  checkSubscription("paid"),
  reminderLimiter,
  validateReminder,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await createCustomReminder(req, res, next)
    } catch (err: any) {
      logger.error(
        `Failed to create reminder for ${req.user?.id}: ${err.message}`,
      )
      next(err)
    }
  },
)

router.get(
  "/",
  protect,
  checkSubscription("trial"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await getCustomReminders(req, res, next)
    } catch (err: any) {
      logger.error(
        `Failed to fetch reminders for ${req.user?.id}: ${err.message}`,
      )
      next(err)
    }
  },
)

router.put(
  "/:id",
  protect,
  checkSubscription("paid"),
  validateReminder,
  async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await updateCustomReminder(req, res, next)
    } catch (err: any) {
      logger.error(`Failed to update reminder ${req.params.id}: ${err.message}`)
      next(err)
    }
  },
)

router.put(
  "/disable/:id",
  protect,
  checkSubscription("paid"),
  async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await disableCustomReminder(req, res, next)
    } catch (err: any) {
      logger.error(
        `Failed to disable reminder ${req.params.id}: ${err.message}`,
      )
      next(err)
    }
  },
)

router.delete(
  "/:id",
  protect,
  checkSubscription("paid"),
  async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await deleteCustomReminder(req, res, next)
    } catch (err: any) {
      logger.error(`Failed to delete reminder ${req.params.id}: ${err.message}`)
      next(err)
    }
  },
)

export default router
