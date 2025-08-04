// src/api/routes/matches.ts
import type { NextFunction, Request, Response } from "express"

import { Router } from "express"
import rateLimit from "express-rate-limit"
import { param } from "express-validator"

import * as MatchController from "../controllers/MatchController"
import { protect } from "../middleware/authMiddleware"
import handleValidationErrors from "../middleware/handleValidationErrors"
import catchAsync from "../utils/catchAsync"

const router = Router()
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 })

/**
 * POST /api/matches
 * Create a new match
 */
router.post(
  "/",
  protect,
  limiter,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await MatchController.createMatch(req, res, next)
    },
  ),
)

/**
 * GET /api/matches
 * List all matches for the authenticated user
 */
router.get(
  "/",
  protect,
  limiter,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await MatchController.getUserMatches(req, res, next)
    },
  ),
)

/**
 * GET /api/matches/:matchId
 * Get a specific match by ID
 */
router.get(
  "/:matchId",
  protect,
  limiter,
  param("matchId", "Invalid match ID").isMongoId(),
  handleValidationErrors,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await MatchController.getMatchById(req, res, next)
    },
  ),
)

/**
 * PATCH /api/matches/:matchId/status
 * Update a match's status
 */
router.patch(
  "/:matchId/status",
  protect,
  limiter,
  param("matchId", "Invalid match ID").isMongoId(),
  handleValidationErrors,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await MatchController.updateMatchStatus(req, res, next)
    },
  ),
)

/**
 * DELETE /api/matches/:matchId
 * Delete a match
 */
router.delete(
  "/:matchId",
  protect,
  limiter,
  param("matchId", "Invalid match ID").isMongoId(),
  handleValidationErrors,
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await MatchController.deleteMatch(req, res, next)
    },
  ),
)

export default router
