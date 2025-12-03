import type { NextFunction, Response } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"

import { createError } from "./errorHandler.js"

export function isVerified(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  const user = req.user
  if (!user || !user.isVerified) {
    return next(
      createError("Please verify your email to perform this action", 403),
    )
  }
  next()
}
