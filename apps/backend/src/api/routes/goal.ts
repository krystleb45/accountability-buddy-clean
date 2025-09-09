import { Router } from "express"
import z from "zod"

import * as goalController from "../controllers/goal-controller"
import { logActivity } from "../middleware/activity-middleware"
import { protect } from "../middleware/auth-middleware"
import { isVerified } from "../middleware/is-verified-middleware"
import {
  trialPrompt,
  validateSubscription,
} from "../middleware/subscription-validation"
import validate from "../middleware/validation-middleware"

const router = Router()

// Apply authentication to all routes
router.use(protect)

/**
 * GET /api/goals
 * Get all of the current user's goals
 * Basic subscription required
 */
router.get("/", validateSubscription, goalController.getUserGoals)

/**
 * GET /api/goals/categories
 * Get all categories for goals defined by user
 * Basic subscription required
 */
router.get(
  "/categories",
  validateSubscription,
  goalController.getUserGoalCategories,
)

/**
 * POST /api/goals
 * Create a new goal
 * Requires subscription + goal limit validation
 */
const goalCreateSchema = z.object({
  title: z.string().min(1, "Please enter a title for your goal"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select or add a category for your goal"),
  dueDate: z.iso.datetime().min(1, "Please enter a dueDate for your goal"),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  visibility: z.enum(["public", "private"]).default("private"),
})

router.post(
  "/",
  isVerified,
  validateSubscription,
  validate({ bodySchema: goalCreateSchema }),
  goalController.createGoal,
  logActivity({
    type: "goal",
    description: "Created a new goal",
  }),
)

/**
 * GET /api/goals/public
 * List goals that are publicly visible
 * No subscription required (public feature)
 */
router.get("/public", goalController.getPublicGoals)

/**
 * GET /api/goals/streak-dates
 * Get the user's streak dates for goals
 * Basic subscription required + trial prompt for analytics
 */
router.get(
  "/streak-dates",
  validateSubscription,
  trialPrompt("streak-analytics"),
  goalController.getStreakDates,
)

/**
 * /api/goals/:goalId
 * Routes for a specific goal by ID
 * All require subscription
 */
router
  .route("/:goalId")
  .get(validateSubscription, goalController.getGoalById)
  .put(
    validateSubscription,
    validate({ bodySchema: goalCreateSchema }),
    goalController.updateGoal,
  ) // Edit/update title, description, etc.
  .delete(validateSubscription, goalController.deleteGoal) // Delete the goal

/**
 * PUT /api/goals/:goalId/progress
 * Update progress on one of the user's goals
 * Basic subscription required
 */
router.patch(
  "/:goalId/progress",
  validateSubscription,
  goalController.updateGoalProgress,
)

/**
 * PUT /api/goals/:goalId/complete
 * Mark a goal as complete
 * Basic subscription required
 */
router.put(
  "/:goalId/complete",
  validateSubscription,
  goalController.completeGoal,
)

export default router
