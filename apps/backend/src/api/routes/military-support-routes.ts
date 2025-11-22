import { Router } from "express"

import * as militarySupportController from "../controllers/military-support-controller"

const router = Router()

/**
 * GET /api/military-support/resources
 * Get external military support resources
 * These are crisis resources that should be available to everyone
 */
router.get("/resources", militarySupportController.getResources)

/**
 * GET /api/military-support/disclaimer
 * Get military support disclaimer
 */
router.get("/disclaimer", militarySupportController.getDisclaimer)

export default router
