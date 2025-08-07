// src/services/profileService.ts
import { http } from "@/lib/http"

export interface ProfileData {
  id: string
  name: string
  email: string
  bio: string
  interests: string[]
  profileImage: string
  coverImage: string
}

interface Envelope<T> {
  success: boolean
  message: string
  data: T
}

const ProfileService = {
  /** GET /profile */
  async getProfile(): Promise<ProfileData> {
    const resp = await http.get<Envelope<ProfileData>>("/profile")
    return resp.data.data
  },

  /** PUT /profile */
  async updateProfile(
    updates: Partial<Pick<ProfileData, "bio" | "interests" | "name" | "email">>,
  ): Promise<ProfileData> {
    const resp = await http.put<Envelope<ProfileData>>("/profile", updates)
    return resp.data.data
  },

  /** Convenience: update only bio */
  async updateBio(newBio: string): Promise<ProfileData> {
    return this.updateProfile({ bio: newBio })
  },

  /** Convenience: update only interests */
  async updateInterests(newInterests: string[]): Promise<ProfileData> {
    return this.updateProfile({ interests: newInterests })
  },

  /** PUT /profile/image */
  async updateProfileImage(file: File): Promise<ProfileData> {
    const form = new FormData()
    form.append("profileImage", file)
    const resp = await http.put<Envelope<ProfileData>>("/profile/image", form)
    return resp.data.data
  },

  /** PUT /profile/cover */
  async updateCoverImage(file: File): Promise<ProfileData> {
    const form = new FormData()
    form.append("coverImage", file)
    const resp = await http.put<Envelope<ProfileData>>("/profile/cover", form)
    return resp.data.data
  },
}

export default ProfileService
