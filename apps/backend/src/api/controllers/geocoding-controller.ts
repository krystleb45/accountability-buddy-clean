import type { AuthenticatedRequest } from "src/types/authenticated-request.type"

import type { ReverseGeocodingInput } from "../routes/geocoding"

import { GeocodingService } from "../services/geocoding-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

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
