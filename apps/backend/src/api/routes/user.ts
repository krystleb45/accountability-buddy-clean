import { Router } from "express"
import z from "zod"

import * as userCtrl from "../controllers/userController"
import { protect } from "../middleware/auth-middleware"
import validate from "../middleware/validation-middleware"

const router = Router()

router.use(protect)

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
