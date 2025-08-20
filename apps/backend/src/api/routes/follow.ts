// src/api/routes/follow.ts
import type { NextFunction, Request, Response } from "express"

import { Router } from "express"
import { param } from "express-validator"

import FollowController from "../controllers/FollowController"
import { protect } from "../middleware/auth-middleware"
import handleValidationErrors from "../middleware/handleValidationErrors"
import catchAsync from "../utils/catchAsync"

const router = Router()

// Follow a user
router.post(
  "/:userId",
  protect,
  param("userId", "Invalid user ID").isMongoId(),
  handleValidationErrors,
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await FollowController.followUser(req, res, next)
  }),
)

// Unfollow a user
router.delete(
  "/:userId",
  protect,
  param("userId", "Invalid user ID").isMongoId(),
  handleValidationErrors,
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await FollowController.unfollowUser(req, res, next)
  }),
)

// Get followers of a user
router.get(
  "/followers/:userId",
  param("userId", "Invalid user ID").isMongoId(),
  handleValidationErrors,
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await FollowController.getFollowers(req, res, next)
  }),
)

// Get users a user is following
router.get(
  "/following/:userId",
  param("userId", "Invalid user ID").isMongoId(),
  handleValidationErrors,
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await FollowController.getFollowing(req, res, next)
  }),
)

export default router
