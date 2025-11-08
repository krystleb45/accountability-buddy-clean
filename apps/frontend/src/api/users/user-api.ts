import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { getApiErrorMessage, http } from "@/utils"

export type Member = Pick<
  User,
  | "_id"
  | "username"
  | "profileImage"
  | "name"
  | "bio"
  | "location"
  | "coverImage"
  | "interests"
  | "settings"
  | "activeStatus"
> & {
  privacy: User["settings"]["privacy"]["profileVisibility"]
  timezone: string
  friends: Pick<User, "_id" | "username" | "profileImage" | "name">[]
}

export async function getMemberByUsername(username: string) {
  try {
    const res = await http.get<Envelope<{ member: Member }>>(
      `/users/${username}`,
    )
    return res.data.data.member
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}
