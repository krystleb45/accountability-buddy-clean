import type { Envelope } from "@/types"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface ProfileData {
  username: string
  email: string
  bio?: string
  interests?: string[] | undefined
  profileImage?: string
  coverImage?: string
}

/**
 * Unified update endpoint: accepts JSON fields or FormData for image uploads.
 */
export async function updateProfile(
  fields: Partial<Pick<ProfileData, "bio" | "interests">>,
) {
  try {
    await http.patch("/profile", fields)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function uploadAvatarImage(file: File) {
  const form = new FormData()
  form.append("image", file)

  try {
    await http.put<Envelope<undefined>>("/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

export async function uploadCoverImage(file: File) {
  const form = new FormData()
  form.append("image", file)

  try {
    await http.put<Envelope<undefined>>("/profile/cover", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  } catch (error) {
    throw new Error(getApiErrorMessage(error as Error))
  }
}

export default {
  updateProfile,
  uploadAvatarImage,
  uploadCoverImage,
}
