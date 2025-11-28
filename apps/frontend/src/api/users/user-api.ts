import type { Envelope } from "@/types"
import type { User } from "@/types/mongoose.gen"

import { getApiErrorMessage, http } from "@/utils"

export interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateUserDto {
  username: string
  email: string
  password?: string
  role?: "user" | "admin" | "moderator" | "military"
}

export const userApi = {
  getUsers: async (page = 1, limit = 20, search = "") => {
    try {
      const { data } = await http.get<Envelope<UsersResponse>>(
        `/users?page=${page}&limit=${limit}&search=${search}`,
      )
      return data.data
    } catch (err) {
      throw new Error(getApiErrorMessage(err as Error))
    }
  },

  createUser: async (userData: CreateUserDto) => {
    try {
      const { data } = await http.post<Envelope<{ user: User }>>(
        "/users",
        userData,
      )
      return data.data.user
    } catch (err) {
      throw new Error(getApiErrorMessage(err as Error))
    }
  },

  deleteUser: async (userId: string) => {
    try {
      const { data } = await http.delete<Envelope<undefined>>(
        `/users/${userId}`,
      )
      return data
    } catch (err) {
      throw new Error(getApiErrorMessage(err as Error))
    }
  },
}

type Member = Pick<
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
