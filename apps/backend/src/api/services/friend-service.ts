import type { Server } from "socket.io"

import { NEW_DM_MESSAGE } from "@ab/shared/socket-events"
import mongoose, { Types } from "mongoose"

import type { User as IUser, UserDocument } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import { CustomError } from "../middleware/errorHandler.js"
import { FriendRequest } from "../models/FriendRequest.js"
import Notification from "../models/Notification.js"
import { User } from "../models/User.js"
import { ChatService } from "./chat-service.js"
import { FileUploadService } from "./file-upload-service.js"
import { UserService } from "./user-service.js"

export async function sendRequest(senderId: string, recipientId: string) {
  if (!mongoose.isValidObjectId(recipientId))
    throw new CustomError("Invalid recipient ID", 400)

  if (senderId === recipientId) {
    throw new CustomError("Cannot friend yourself", 400)
  }

  const exists = await FriendRequest.findOne({
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId },
    ],
  })
  if (exists) {
    throw new CustomError("Request already exists", 400)
  }

  await FriendRequest.create({
    sender: senderId,
    recipient: recipientId,
    status: "pending",
  })
  await Notification.createNotification({
    user: new Types.ObjectId(recipientId),
    sender: new Types.ObjectId(senderId),
    message: `User ${senderId} sent you a friend request.`,
    type: "friend_request",
    link: "/friends/requests",
  })
}

export async function acceptRequest(requestId: string, userId: string) {
  const reqDoc = await FriendRequest.findById(requestId)

  if (!reqDoc) {
    throw new CustomError("Friend request not found", 404)
  }

  if (reqDoc.recipient._id.toString() !== userId) {
    throw new CustomError("Not allowed", 403)
  }

  reqDoc.status = "accepted"
  await reqDoc.save()

  const other = reqDoc.sender.toString()
  await User.findByIdAndUpdate(userId, { $addToSet: { friends: other } })
  await User.findByIdAndUpdate(other, { $addToSet: { friends: userId } })

  await Notification.createNotification({
    user: new Types.ObjectId(other),
    sender: new Types.ObjectId(userId),
    message: `${userId} accepted your friend request.`,
    type: "friend_request",
    link: "/friends",
  })
}

export async function declineRequest(requestId: string, userId: string) {
  if (!mongoose.isValidObjectId(requestId))
    throw new CustomError("Invalid request ID", 400)

  const reqDoc = await FriendRequest.findById(requestId)
  if (!reqDoc) {
    throw new CustomError("Friend request not found", 404)
  }
  if (reqDoc.recipient._id.toString() !== userId)
    throw new CustomError("Not allowed", 403)

  reqDoc.status = "declined"
  await reqDoc.save()

  await Notification.createNotification({
    user: new Types.ObjectId(reqDoc.sender.toString()),
    sender: new Types.ObjectId(userId),
    message: `${userId} declined your friend request.`,
    type: "friend_request",
    link: "/friends",
  })
}

export async function listFriends(userId: string) {
  if (!mongoose.isValidObjectId(userId))
    throw new CustomError("Invalid user ID", 400)

  const user = await User.findById(userId).populate("friends", "username")

  if (!user) {
    throw new CustomError("User not found", 404)
  }

  const friends = await Promise.all(
    user.friends.map(async (friend) => {
      const friendProfile = await UserService.getMemberByUsername(
        (friend as IUser).username,
        userId,
      )

      const canDm = await UserService.canSendMessage(
        userId,
        friendProfile._id.toString(),
      )

      return { ...friendProfile, canDm }
    }),
  )

  return friends
}

export async function pendingRequests(userId: string) {
  if (!mongoose.isValidObjectId(userId))
    throw new CustomError("Invalid user ID", 400)

  const requests = await FriendRequest.find({
    recipient: userId,
    status: "pending",
  }).populate("sender")

  // get signed URLs for profile images
  const populatedRequests = []
  for (const req of requests) {
    const sender = req.sender as UserDocument
    populatedRequests.push({
      ...req.toObject(),
      sender: {
        ...sender.toObject(),
        profileImage: sender.profileImage
          ? await FileUploadService.generateSignedUrl(sender.profileImage)
          : undefined,
      },
    })
  }

  return populatedRequests
}

export async function aiRecommendations(userId: string): Promise<
  Array<{
    id: string
    _id: string
    name: string
    email: string
    username: string
    profileImage: string
    interests: string[]
    mutualFriends: number
    similarityScore: number
    bio: string
    category: string
    activeStatus: "online" | "offline"
  }>
> {
  try {
    // Step 1: Get current user data
    const currentUser = await User.findById(userId)
      .select("username email profileImage friends goals interests location")
      .lean()

    if (!currentUser) {
      throw new CustomError("User not found", 404)
    }

    // Get current user's friend IDs as strings for exclusion
    const currentFriendIds = currentUser.friends.map(
      (friend) => friend._id?.toString() || friend.toString(),
    )

    // Step 2: Get all pending/sent friend requests to exclude them
    const pendingRequests = await FriendRequest.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: { $in: ["pending", "accepted"] },
    })
      .select("sender recipient")
      .lean()

    const excludedUserIds = new Set([
      userId, // Exclude self
      ...currentFriendIds, // Exclude current friends
      ...pendingRequests.map((req) => req.sender._id.toString()),
      ...pendingRequests.map((req) => req.recipient._id.toString()),
    ])

    // Step 3: Build recommendation pipeline
    const pipeline = [
      // Match potential friends (exclude self, current friends, and pending requests)
      {
        $match: {
          _id: {
            $nin: Array.from(excludedUserIds).map(
              (id) => new Types.ObjectId(id),
            ),
          },
          // Only include active users
          active: { $ne: false },
          role: {
            $ne: "admin", // Exclude admins
          },
        },
      },

      // Add computed similarity score
      {
        $addFields: {
          similarityScore: {
            $add: [
              // Interest similarity (40% weight)
              {
                $multiply: [
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $isArray: "$interests" },
                          {
                            $gt: [
                              { $size: { $ifNull: ["$interests", []] } },
                              0,
                            ],
                          },
                        ],
                      },
                      then: {
                        $cond: {
                          if: {
                            $gt: [
                              {
                                $size: {
                                  $literal: currentUser.interests || [],
                                },
                              },
                              0,
                            ],
                          },
                          then: {
                            $divide: [
                              {
                                $size: {
                                  $setIntersection: [
                                    "$interests",
                                    { $literal: currentUser.interests || [] },
                                  ],
                                },
                              },
                              {
                                $max: [
                                  {
                                    $size: {
                                      $setUnion: [
                                        "$interests",
                                        {
                                          $literal: currentUser.interests || [],
                                        },
                                      ],
                                    },
                                  },
                                  1,
                                ],
                              },
                            ],
                          },
                          else: 0,
                        },
                      },
                      else: 0,
                    },
                  },
                  40,
                ],
              },

              // Location proximity (30% weight)
              {
                $multiply: [
                  {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: ["$location.city", null] },
                          {
                            $ne: [
                              { $literal: currentUser.location?.city },
                              null,
                            ],
                          },
                          {
                            $eq: [
                              "$location.city",
                              { $literal: currentUser.location?.city },
                            ],
                          },
                        ],
                      },
                      then: 1,
                      else: {
                        $cond: {
                          if: {
                            $and: [
                              { $ne: ["$location.country", null] },
                              {
                                $ne: [
                                  { $literal: currentUser.location?.country },
                                  null,
                                ],
                              },
                              {
                                $eq: [
                                  "$location.country",
                                  { $literal: currentUser.location?.country },
                                ],
                              },
                            ],
                          },
                          then: 0.5,
                          else: 0,
                        },
                      },
                    },
                  },
                  30,
                ],
              },

              // Mutual friends boost (30% weight)
              {
                $multiply: [
                  {
                    $cond: {
                      if: { $isArray: "$friends" },
                      then: {
                        $min: [
                          {
                            $divide: [
                              {
                                $size: {
                                  $setIntersection: [
                                    "$friends",
                                    {
                                      $literal: currentFriendIds.map(
                                        (id) => new Types.ObjectId(id),
                                      ),
                                    },
                                  ],
                                },
                              },
                              10, // Cap at 10 mutual friends for scoring
                            ],
                          },
                          1,
                        ],
                      },
                      else: 0,
                    },
                  },
                  30,
                ],
              },
            ],
          },

          // Calculate mutual friends count for display
          mutualFriendsCount: {
            $cond: {
              if: { $isArray: "$friends" },
              then: {
                $size: {
                  $setIntersection: [
                    "$friends",
                    {
                      $literal: currentFriendIds.map(
                        (id) => new Types.ObjectId(id),
                      ),
                    },
                  ],
                },
              },
              else: 0,
            },
          },
        },
      },

      // Only include users with some similarity
      {
        $match: {
          similarityScore: { $gte: 0 },
        },
      },

      // Sort by similarity score (highest first)
      {
        $sort: { similarityScore: -1 as const },
      },

      // Limit results
      {
        $limit: 20,
      },

      // Project final fields
      {
        $project: {
          id: { $toString: "$_id" },
          _id: { $toString: "$_id" },
          name: { $ifNull: ["$username", "$email"] },
          email: 1,
          username: 1,
          profileImage: {
            $ifNull: ["$profileImage", "/default-avatar.svg"],
          },
          interests: { $ifNull: ["$interests", []] },
          mutualFriends: "$mutualFriendsCount",
          similarityScore: { $round: ["$similarityScore", 1] },
          bio: { $ifNull: ["$bio", ""] },
          activeStatus: "$activeStatus",
          // Categorize based on strongest similarity factor
          category: {
            $switch: {
              branches: [
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            {
                              $setIntersection: [
                                {
                                  $map: {
                                    input: { $ifNull: ["$interests", []] },
                                    as: "interest",
                                    in: { $toLower: "$$interest" },
                                  },
                                },
                                // @keep-sorted
                                [
                                  "cycling",
                                  "exercise",
                                  "fitness",
                                  "health",
                                  "nutrition",
                                  "running",
                                  "swimming",
                                  "wellness",
                                  "workout",
                                  "yoga",
                                ],
                              ],
                            },
                            [],
                          ],
                        },
                      },
                      0,
                    ],
                  },
                  then: "fitness",
                },
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            {
                              $setIntersection: [
                                {
                                  $map: {
                                    input: { $ifNull: ["$interests", []] },
                                    as: "interest",
                                    in: { $toLower: "$$interest" },
                                  },
                                },
                                // @keep-sorted
                                [
                                  "academic",
                                  "courses",
                                  "education",
                                  "knowledge",
                                  "learning",
                                  "reading",
                                  "research",
                                  "study",
                                  "training",
                                ],
                              ],
                            },
                            [],
                          ],
                        },
                      },
                      0,
                    ],
                  },
                  then: "study",
                },
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            {
                              $setIntersection: [
                                {
                                  $map: {
                                    input: { $ifNull: ["$interests", []] },
                                    as: "interest",
                                    in: { $toLower: "$$interest" },
                                  },
                                },
                                // @keep-sorted
                                [
                                  "business",
                                  "career",
                                  "entrepreneurship",
                                  "finance",
                                  "leadership",
                                  "management",
                                  "marketing",
                                  "networking",
                                  "professional",
                                ],
                              ],
                            },
                            [],
                          ],
                        },
                      },
                      0,
                    ],
                  },
                  then: "career",
                },
                {
                  case: {
                    $gt: [
                      {
                        $size: {
                          $ifNull: [
                            {
                              $setIntersection: [
                                {
                                  $map: {
                                    input: { $ifNull: ["$interests", []] },
                                    as: "interest",
                                    in: { $toLower: "$$interest" },
                                  },
                                },
                                // @keep-sorted
                                [
                                  "ai",
                                  "coding",
                                  "computer",
                                  "data",
                                  "development",
                                  "engineering",
                                  "programming",
                                  "software",
                                  "tech",
                                  "technology",
                                ],
                              ],
                            },
                            [],
                          ],
                        },
                      },
                      0,
                    ],
                  },
                  then: "tech",
                },
              ],
              default: "general",
            },
          },
        },
      },
    ]

    // Execute the aggregation
    const recommendations = await User.aggregate(pipeline)

    // If we have fewer than 5 recommendations, fill with random active users
    if (recommendations.length < 5) {
      logger.info(
        `Adding random users to reach minimum recommendations. Current: ${recommendations.length}`,
      )

      const additionalUsers = await User.find({
        _id: {
          $nin: [
            ...Array.from(excludedUserIds).map((id) => new Types.ObjectId(id)),
            ...recommendations.map((r) => new Types.ObjectId(r._id)),
          ],
        },
        active: { $ne: false },
        role: { $ne: "admin" }, // Exclude admins
      })
        .select("username email profileImage bio interests activeStatus")
        .limit(5 - recommendations.length)
        .lean()

      // Format additional users to match recommendation structure
      const formattedAdditional = additionalUsers.map((user) => ({
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.username || user.email,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage || "/default-avatar.svg",
        interests: user.interests || [],
        mutualFriends: 0,
        similarityScore: 1,
        bio:
          user.bio ||
          `Hello! I'm ${user.username || "a new user"} looking to connect with others.`,
        category: "general",
        activeStatus: user.activeStatus,
      }))

      recommendations.push(...formattedAdditional)
    }

    // Process signed URLs for profile images
    for (const rec of recommendations) {
      if (rec.profileImage && !rec.profileImage.startsWith("http")) {
        try {
          rec.profileImage = await FileUploadService.generateSignedUrl(
            rec.profileImage,
          )
        } catch (imageError) {
          logger.warn(
            `Failed to generate signed URL for profile image: ${rec.profileImage}`,
            imageError,
          )
          rec.profileImage = "/default-avatar.svg"
        }
      }
    }

    return recommendations
  } catch (error) {
    logger.error("❌ Error in aiRecommendations:", error)

    // Fallback to basic recommendations in case of error
    try {
      logger.info("🔄 Attempting fallback recommendations")
      const fallbackUsers = await User.find({
        _id: { $ne: userId },
        active: { $ne: false },
        role: { $ne: "admin" }, // Exclude admins
      })
        .select("username email profileImage bio interests activeStatus")
        .limit(6)
        .lean()

      const formattedFallbackUsers = fallbackUsers.map((user) => ({
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.username || user.email,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage || "/default-avatar.svg",
        interests: user.interests || [],
        mutualFriends: 0,
        similarityScore: 1,
        bio:
          user.bio ||
          `Hello! I'm ${user.username || "a new user"} looking to connect with others.`,
        category: "general",
        activeStatus: user.activeStatus,
      }))

      // Process signed URLs for profile images
      for (const rec of formattedFallbackUsers) {
        if (rec.profileImage && !rec.profileImage.startsWith("http")) {
          try {
            rec.profileImage = await FileUploadService.generateSignedUrl(
              rec.profileImage,
            )
          } catch (imageError) {
            logger.warn(
              `Failed to generate signed URL for profile image in fallback: ${rec.profileImage}`,
              imageError,
            )
            rec.profileImage = "/default-avatar.svg"
          }
        }
      }

      return formattedFallbackUsers
    } catch (fallbackError) {
      logger.error("❌ Error in fallback recommendations:", fallbackError)
      return []
    }
  }
}

export async function sendMessage(
  userId: string,
  friendId: string,
  message: string,
  io: Server,
) {
  // Check if they are friends
  const user = await User.findById(userId).select("friends")
  if (!user) {
    throw new CustomError("User not found", 404)
  }

  const isFriend = user.friends.some((friend) => friend.toString() === friendId)
  if (!isFriend) {
    throw new CustomError("Can only message friends", 403)
  }

  // Check if friend can receive messages
  const canDm = await UserService.canSendMessage(userId, friendId)
  if (!canDm) {
    throw new CustomError("Cannot send message to this friend", 403)
  }

  // Get chat
  const chatId = (
    await ChatService.getOrCreatePrivateChat(userId, friendId)
  )._id.toString()

  // Send message
  const messageResponse = await ChatService.sendMessage({
    chatId,
    senderId: userId,
    receiverId: friendId,
    content: message,
  })

  // Emit socket event to friend chat
  io.to(chatId).emit(NEW_DM_MESSAGE, {
    ...messageResponse.toObject(),
    text: message, // message has encrypted content
  })
}

export async function getMessages(
  userId: string,
  friendId: string,
  options: { page: number; limit: number },
) {
  // Check if they are friends
  const user = await User.findById(userId).select("friends")
  if (!user) {
    throw new CustomError("User not found", 404)
  }

  const isFriend = user.friends.some((friend) => friend.toString() === friendId)
  if (!isFriend) {
    throw new CustomError("Can only view messages with friends", 403)
  }

  // get chat
  const chat = await ChatService.getOrCreatePrivateChat(userId, friendId)

  // Get messages with pagination
  const messages = await ChatService.fetchMessages(chat._id.toString(), options)

  return messages
}
