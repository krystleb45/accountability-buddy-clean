export const FRIENDSHIP_STATUS = ["pending", "accepted", "declined"] as const

export type FriendRequestStatus = (typeof FRIENDSHIP_STATUS)[number]
