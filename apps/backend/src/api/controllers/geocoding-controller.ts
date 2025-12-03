import type { AuthenticatedRequest } from "../../types/authenticated-request.type.js"
import type { ReverseGeocodingInput } from "../routes/geocoding.js"

import { GeocodingService } from "../services/geocoding-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export class GeocodingController {
  static reverseGeocode = catchAsync(
    async (
      req: AuthenticatedRequest<
        unknown,
        unknown,
        unknown,
        ReverseGeocodingInput
      >,
      res,
    ) => {
      const { latitude, longitude } = req.query

      const address = await GeocodingService.reverseGeocode(latitude, longitude)

      sendResponse(res, 200, true, "Address retrieved successfully", address)
    },
  )
}
