import { Router } from "express"
import z from "zod"

import * as userCtrl from "../controllers/userController"
import { protect, restrictTo } from "../middleware/auth-middleware"
import validate from "../middleware/validation-middleware"

const router = Router()

router.use(protect)

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get(
  "/",
  protect,
  restrictTo("admin"),
  validate({
    querySchema: z.object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      search: z.string().optional(),
    }),
  }),
  userCtrl.getAllUsers,
)

/**
 * POST /api/users
 * Create a new user (admin only)
 */
const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["user", "admin", "moderator", "military"]).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

router.post(
  "/",
  protect,
  restrictTo("admin"),
  validate({
    bodySchema: createUserSchema,
  }),
  userCtrl.createUser,
)

/**
 * DELETE /api/users/:id
 * Delete a user (admin only)
 */
router.delete("/:id", protect, restrictTo("admin"), userCtrl.deleteUser)

/**
 * GET /api/users/:username
 * Get member info by username
 */
router.get(
  "/:username",
  protect,
  validate({
    paramsSchema: z.object({
      username: z.string(),
    }),
  }),
  userCtrl.getMemberInfo,
)

export default router
