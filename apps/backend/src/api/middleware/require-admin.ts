import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"

import { createError } from "./errorHandler.js"

/**
 * Middleware to require admin role
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return next(createError("Authentication required", 401))
  }

  if (req.user.role !== "admin") {
    return next(createError("Admin access required", 403))
  }

  next()
}