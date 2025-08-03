import type { NextFunction, Request, Response, Router } from "express";

import express from "express";
import rateLimit from "express-rate-limit";
import { check } from "express-validator";
import sanitize from "mongo-sanitize";

import {
  createReport,
  deleteReport,
  getAllReports,
  getReportById,
  resolveReport,
} from "../controllers/ReportController";
import { protect } from "../middleware/authMiddleware";
import handleValidationErrors from "../middleware/handleValidationErrors";
import { roleBasedAccessControl } from "../middleware/roleBasedAccessControl";

const router: Router = express.Router();

// ─── rate limiter ───────────────────────────────────────────────────────────────
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many reports from this IP, please try again later.",
  },
});

// ─── validation chain ────────────────────────────────────────────────────────────
const reportValidation = [
  check("reportedId", "Reported ID is required and must be a valid Mongo ID")
    .notEmpty()
    .isMongoId(),
  check("reportType", "Report type must be one of [post, comment, user]")
    .notEmpty()
    .isIn(["post", "comment", "user"]),
  check("reason", "Reason is required and max 300 chars")
    .notEmpty()
    .isLength({ max: 300 }),
];

// ─── sanitizer ──────────────────────────────────────────────────────────────────
function sanitizeInput (req: Request,  _res: Response,  next: NextFunction): void {
  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  next();
}

// ─── Create ─────────────────────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  reportLimiter,
  reportValidation,
  sanitizeInput,
  handleValidationErrors,
  createReport
);

// ─── Read all (admin only) ───────────────────────────────────────────────────────
router.get(
  "/",
  protect,
  roleBasedAccessControl(["admin"]),
  getAllReports
);

// ─── Read one ────────────────────────────────────────────────────────────────────
router.get(
  "/:id",
  protect,
  roleBasedAccessControl(["admin"]),
  getReportById
);

// ─── Resolve ─────────────────────────────────────────────────────────────────────
router.put(
  "/:id/resolve",
  protect,
  roleBasedAccessControl(["admin"]),
  resolveReport
);

// ─── Delete ──────────────────────────────────────────────────────────────────────
router.delete(
  "/:id",
  protect,
  roleBasedAccessControl(["admin"]),
  deleteReport
);

export default router;
