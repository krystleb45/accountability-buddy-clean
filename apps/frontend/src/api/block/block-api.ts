import type { Envelope } from "@/types"

import { http } from "@/lib/http"
import { getApiErrorMessage } from "@/utils"

export interface BlockedUser {
  _id: string
  username: string
  name?: string
  profileImage?: string
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  try {
    const response = await http.get<Envelope<{ blockedUsers: BlockedUser[] }>>("/block")
    return response.data.data.blockedUsers
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function blockUser(userId: string): Promise<void> {
  try {
    await http.post(`/block/${userId}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function unblockUser(userId: string): Promise<void> {
  try {
    await http.delete(`/block/${userId}`)
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

export async function checkIfBlocked(userId: string): Promise<boolean> {
  try {
    const response = await http.get<Envelope<{ isBlocked: boolean }>>(`/block/check/${userId}`)
    return response.data.data.isBlocked
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}