import MilitarySupportService from "../services/military-support-service.js"
import catchAsync from "../utils/catchAsync.js"
import sendResponse from "../utils/sendResponse.js"

export const getResources = catchAsync(async (_req, res) => {
  const resources = await MilitarySupportService.listResources()
  sendResponse(res, 200, true, "Resources fetched successfully", { resources })
})

export const getDisclaimer = catchAsync(async (_req, res) => {
  const disclaimer = MilitarySupportService.getDisclaimer()
  sendResponse(res, 200, true, "Disclaimer fetched successfully", {
    disclaimer,
  })
})
