import type { NextFunction, Request, Response } from "express"
import type { ZodObject } from "zod"

import { ZodError } from "zod"

import { logger } from "../../utils/winston-logger"
import { createError } from "./errorHandler"

interface Schema {
  querySchema?: ZodObject
  bodySchema?: ZodObject
  paramsSchema?: ZodObject
  headerSchema?: ZodObject
}

/**
 * Middleware for handling request validation
 * @param {Schema} schemas - Zod schema to validate the request body
 * @returns Middleware function to validate requests
 */
export function validate({
  querySchema,
  bodySchema,
  paramsSchema,
  headerSchema,
}: Schema): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await querySchema?.parseAsync(req.query)
      await bodySchema?.parseAsync(req.body)
      await paramsSchema?.parseAsync(req.params)
      await headerSchema?.parseAsync(req.headers)

      next()
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("Zod validation failed", { errors: error.issues })
        next(createError("Validation error", 400, error.issues))
        return
      }

      // Log and handle unexpected errors
      logger.error("Unexpected error during validation", { error })

      next(createError("Internal server error during validation", 500))
    }
  }
}

export default validate
