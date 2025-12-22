import { Router } from "express"
import { protect } from "../middleware/auth-middleware.js"
import sendResponse from "../utils/sendResponse.js"

const router = Router()

// GET /api/blog - Return empty posts for now
router.get("/", protect, (req, res) => {
  sendResponse(res, 200, true, "Blog posts fetched", {
    posts: []
  })
})

export default router