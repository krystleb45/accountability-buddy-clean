import { createError } from "../middleware/errorHandler.js"
import { ExternalSupportResource } from "../models/MilitaryResource.js"

const DISCLAIMER_TEXT = `
  Disclaimer: The information provided in this platform is for support purposes only
  and does not replace professional medical, legal, or mental health advice.
  If you are in crisis, please contact emergency services or a licensed professional immediately.
`.trim()

class MilitarySupportService {
  /** List all active resources, most recent first. */
  static async listResources() {
    const resources = await ExternalSupportResource.find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec()

    if (resources.length === 0) {
      throw createError("No military support resources found", 404)
    }

    return resources
  }

  /** Get disclaimer text. */
  static getDisclaimer() {
    return DISCLAIMER_TEXT
  }
}

export default MilitarySupportService
