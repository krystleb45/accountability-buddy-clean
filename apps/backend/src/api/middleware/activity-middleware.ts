import type { RequestHandler } from "express"

import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { Activity } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import ActivityService from "../services/activity-service.js"

export function logActivity(
  data: Pick<Activity, "type" | "description" | "metadata">,
): RequestHandler {
  return async (req: AuthenticatedRequest, res, next) => {
    try {
      if (res.statusCode >= 400) {
        return next() // Don't log activity for failed requests
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
  }
}
