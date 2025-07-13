// src/api/controllers/HealthCheckController.ts - Compatible with your existing structure
import type { Request, Response } from "express";
import sendResponse from "../utils/sendResponse";
import HealthCheckService from "../services/HealthCheckService";

/**
 * @desc Health check endpoint with Redis status
 * @route GET /api/health
 * @access Public
 */
export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  const report = HealthCheckService.getHealthReport();

  // Status is 200 if database is connected (Redis being disabled is fine)
  const status = report.database === "connected" ? 200 : 500;
  const success = report.database === "connected";

  // Enhanced message that includes Redis status
  let message = `Health check status - Database: ${report.database}`;
  if (report.redis.disabled) {
    message += ", Redis: disabled (configured)";
  }

  sendResponse(res, status, success, message, report);
};

/**
 * @desc Readiness check endpoint
 * @route GET /api/ready
 * @access Public
 */
export const readinessCheck = (_req: Request, res: Response): void => {
  const ready = HealthCheckService.isReady();

  if (ready) {
    sendResponse(res, 200, true, "Server is ready for requests");
  } else {
    sendResponse(res, 500, false, "Server is not ready yet");
  }
};
