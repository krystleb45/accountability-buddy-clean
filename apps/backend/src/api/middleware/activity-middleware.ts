import type { RequestHandler } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { Activity } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import ActivityService from "../services/activity-service.js"

type ActivityData = Pick<Activity, "type" | "description" | "metadata">
type ActivityDataFn = (req: AuthenticatedRequest) => ActivityData | null

export function logActivity(
  dataOrFn: ActivityData | ActivityDataFn,
): RequestHandler {
  return async (req: AuthenticatedRequest, _res, _next) => {
    try {
      // Check if user exists on request
      if (!req.user?._id) {
        return
      }

      // Support both static data and dynamic function
      const data = typeof dataOrFn === "function" ? dataOrFn(req) : dataOrFn

      // If function returns null, skip logging
      if (!data) {
        return
      }

      await ActivityService.logActivity(
        req.user._id.toString(),
        data.type,
        data.description,
        data.metadata || {},
      )
    } catch (error) {
      logger.error("Failed to log activity", error)
    }
    // Fire-and-forget - don't call next(), response already sent
  }
}