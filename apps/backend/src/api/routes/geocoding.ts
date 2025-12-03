import { Router } from "express"
import z from "zod"

import { GeocodingController } from "../controllers/geocoding-controller.js"
import { protect } from "../middleware/auth-middleware.js"
import validate from "../middleware/validation-middleware.js"

const router = Router()

/**
 * ======================
 *    REVERSE GEOCODING
 *========================*
 */
const reverseGeocodingSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
})

export type ReverseGeocodingInput = z.infer<typeof reverseGeocodingSchema>

router.get(
  "/address",
  protect,
  validate({
    querySchema: reverseGeocodingSchema,
  }),
  GeocodingController.reverseGeocode,
)

export default router
