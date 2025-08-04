// src/follow/followApi.ts

import axios from "axios"

import { http } from "@/utils/http"

/** Minimal user shape returned by the follow endpoints */
export interface FollowUser {
  id: string
  name: string
  avatarUrl?: string
}

/**
 * Follow a user.
 * POST /follow
 * @returns true on success, false on failure
 */
export async function followUser(targetUserId: string): Promise<boolean> {
  if (!targetUserId) {
    console.error("[followApi::followUser] targetUserId is required")
    return false
  }
  try {
    await http.post("/follow", { targetUserId })
    return true
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[followApi::followUser]",
        error.response?.data || error.message,
      )
    } else {
      console.error("[followApi::followUser]", error)
    }
    return false
  }
}

/**
 * Unfollow a user.
 * DELETE /follow/:targetUserId
 * @returns true on success, false on failure
 */
export async function unfollowUser(targetUserId: string): Promise<boolean> {
  if (!targetUserId) {
    console.error("[followApi::unfollowUser] targetUserId is required")
    return false
  }
  try {
    await http.delete(`/follow/${encodeURIComponent(targetUserId)}`)
    return true
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[followApi::unfollowUser]",
        error.response?.data || error.message,
      )
    } else {
      console.error("[followApi::unfollowUser]", error)
    }
    return false
  }
}

/**
 * Get all followers of a user.
 * GET /followers/:userId
 * @returns array of FollowUser, or empty on failure
 */
export async function getFollowers(userId: string): Promise<FollowUser[]> {
  if (!userId) {
    console.error("[followApi::getFollowers] userId is required")
    return []
  }
  try {
    const resp = await http.get<FollowUser[]>(
      `/followers/${encodeURIComponent(userId)}`,
    )
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[followApi::getFollowers]",
        error.response?.data || error.message,
      )
    } else {
      console.error("[followApi::getFollowers]", error)
    }
    return []
  }
}

/**
 * Get all users a given user is following.
 * GET /following/:userId
 * @returns array of FollowUser, or empty on failure
 */
export async function getFollowing(userId: string): Promise<FollowUser[]> {
  if (!userId) {
    console.error("[followApi::getFollowing] userId is required")
    return []
  }
  try {
    const resp = await http.get<FollowUser[]>(
      `/following/${encodeURIComponent(userId)}`,
    )
    return resp.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "[followApi::getFollowing]",
        error.response?.data || error.message,
      )
    } else {
      console.error("[followApi::getFollowing]", error)
    }
    return []
  }
}

export default {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
}
