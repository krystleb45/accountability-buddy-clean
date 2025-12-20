import type { NextFunction, Request, Response } from "express"

import { Router } from "express"
import rateLimit from "express-rate-limit"
import sanitize from "mongo-sanitize"
import z from "zod"

import * as settingsController from "../controllers/SettingsController.js"
import { protect } from "../middleware/auth-middleware.js"
import validate from "../middleware/validation-middleware.js"

const router = Router()

// 10 requests per 15 minutes
const settingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many settings requests, please try again later.",
})

// sanitize only req.body
function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  req.body = sanitize(req.body)
  next()
}

/** GET /api/settings */
router.get("/", protect, settingsController.getUserSettings)

/** PUT /api/settings/update */
const settingsUpdateSchema = z
  .object({
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
    }),
    privacy: z.object({
      profileVisibility: z.enum(["public", "friends", "private"]),
    }),
  })
  .partial()

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>

router.put(
  "/update",
  protect,
  settingsLimiter,
  sanitizeBody,
  validate({
    bodySchema: settingsUpdateSchema,
  }),
  settingsController.updateUserSettings,
)

/** PUT /api/settings/password */
const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>

router.put(
  "/password",
  protect,
  settingsLimiter,
  sanitizeBody,
  validate({
    bodySchema: passwordUpdateSchema,
  }),
  settingsController.updateUserPassword,
)

/** DELETE /api/settings/account */
router.delete("/account", protect, settingsController.deleteUserAccount)

export default router
