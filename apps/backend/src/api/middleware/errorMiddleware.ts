// src/middleware/errorMiddleware.ts
import type { NextFunction, Request, Response } from "express"

import { logger } from "../../utils/winston-logger"

// Export the CustomError interface
export interface CustomError extends Error {
  statusCode?: number // Make this optional
  details?: any
}

function errorMiddleware(
  error: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log the error details
  logger.error(
    `Error: ${error.message}, Status: ${error.statusCode || 500}, Path: ${
      req.path
    }, IP: ${req.ip}`,
  )

  // Send a response back with the error message and status
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { details: error.details }), // Show details only in development
  })
}

export default errorMiddleware
