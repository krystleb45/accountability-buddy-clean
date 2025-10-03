import { Router } from "express"
import z from "zod"

import {
  updateProfile,
  uploadCoverImage,
  uploadProfileImage,
} from "../controllers/profile-controller"
import { protect } from "../middleware/auth-middleware"
import validate from "../middleware/validation-middleware"
import { FileUploadService } from "../services/file-upload-service"

const router = Router()

const updateProfileSchema = z.object({
  username: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  interests: z.array(z.string().trim()).optional(),
  location: z
    .object({
      city: z.string().trim(),
      state: z.string().trim(),
      country: z.string().trim(),
      coordinates: z
        .object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        })
        .optional(),
    })
    .optional(),
})
export type UpdateProfileData = z.infer<typeof updateProfileSchema>

router.patch(
  "/",
  protect,
  validate({
    bodySchema: updateProfileSchema,
  }),
  updateProfile,
)

// alias
router.put("/update", protect, updateProfile)

/**
 * PUT /api/profile/avatar
 */
router.put(
  "/avatar",
  protect,
  FileUploadService.multerUpload.single("image"),
  uploadProfileImage,
)

/**
 * PUT /api/profile/cover
 * multipart/form-data with field name "image"
 */
router.put(
  "/cover",
  protect,
  FileUploadService.multerUpload.single("image"),
  uploadCoverImage,
)

export default router
