import type { NextFunction, Request, Response } from "express"
import type { ZodObject } from "zod"

import status from "http-status"
import { ZodError } from "zod"

import { logger } from "../../utils/winstonLogger"

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
        res.status(status.BAD_REQUEST).json({
          success: false,
          message: "Validation error",
          errors: error.issues,
        })
        return
      }

      // Log and handle unexpected errors
      logger.error("Unexpected error during validation", { error })

      res.status(status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error during validation.",
      })
    }
  }
}

export default validate
