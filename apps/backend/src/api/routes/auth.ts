import { Router } from "express"
import rateLimit from "express-rate-limit"
import z from "zod"

import authController from "../controllers/authController"
import { protect } from "../middleware/authMiddleware"
import validate from "../middleware/validation-middleware"
import catchAsync from "../utils/catchAsync"

const router = Router()

// ─── limit login/register to 10 per 15min ─────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts. Please try again later.",
})

// ─── POST /api/auth/register ─────────────────────────────────────────────
router.post(
  "/register",
  authLimiter,
  validate({
    bodySchema: z.object({
      email: z.email("Email must be valid"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      username: z.string().nonempty("Username is required"),
    }),
  }),
  catchAsync(async (req, res, next) => {
    await authController.register(req, res, next)
  }),
)

// ─── POST /api/auth/login ────────────────────────────────────────────────
router.post(
  "/login",
  authLimiter,
  validate({
    bodySchema: z.object({
      email: z.email("Email must be valid").trim().toLowerCase(),
      password: z.string().min(8, "Password must be at least 8 characters"),
    }),
  }),
  catchAsync(async (req, res, next) => {
    await authController.login(req, res, next)
  }),
)

// ─── POST /api/auth/refresh-token ───────────────────────────────────────
router.post(
  "/refresh-token",
  validate({
    bodySchema: z.object({
      refreshToken: z.string().nonempty("Refresh token is required"),
    }),
  }),
  catchAsync(async (req, res, next) => {
    await authController.refreshToken(req, res, next)
  }),
)

// ─── POST /api/auth/logout ───────────────────────────────────────────────
router.post(
  "/logout",
  catchAsync(async (req, res, next) => {
    await authController.logout(req, res, next)
  }),
)

// ─── GET /api/auth/me ────────────────────────────────────────────────────
router.get(
  "/me",
  protect,
  catchAsync(async (req, res, next) => {
    await authController.getCurrentUser(req, res, next)
  }),
)

export default router
