import MilitarySupportService from "../services/military-support-service"
import catchAsync from "../utils/catchAsync"
import sendResponse from "../utils/sendResponse"

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
