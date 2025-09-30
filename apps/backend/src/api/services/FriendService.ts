import type { User as IUser, UserDocument } from "src/types/mongoose.gen"

import mongoose, { Types } from "mongoose"

import { logger } from "../../utils/winstonLogger"
import { createError } from "../middleware/errorHandler"
import Follow from "../models/Follow"
import { FriendRequest } from "../models/FriendRequest"
import Notification from "../models/Notification"
import { User } from "../models/User"
import { FileUploadService } from "./file-upload-service"

interface Follower {
  id: string
  name: string
  avatarUrl?: string
}
type Following = Follower

const FriendService = {
  // ─── FOLLOWS ─────────────────────────────────────────
  async follow(userId: string, targetId: string): Promise<void> {
    if (!mongoose.isValidObjectId(targetId))
      throw createError("Invalid target user ID", 400)
    if (userId === targetId) throw createError("Cannot follow yourself", 400)

    const exists = await Follow.findOne({ user: userId, targetUser: targetId })
    if (exists) return

    await Follow.create({ user: userId, targetUser: targetId })
    await Notification.createNotification({
      user: new Types.ObjectId(targetId),
      sender: new Types.ObjectId(userId),
      message: `User ${userId} started following you.`,
      type: "message",
      link: `/users/${userId}`,
    })
  },

  async unfollow(userId: string, targetId: string): Promise<void> {
    if (!mongoose.isValidObjectId(targetId))
      throw createError("Invalid target user ID", 400)
    await Follow.deleteOne({ user: userId, targetUser: targetId })
  },

  async getFollowers(userId: string): Promise<Follower[]> {
    if (!mongoose.isValidObjectId(userId))
      throw createError("Invalid user ID", 400)

    const docs = await Follow.find({ targetUser: userId }).populate<{
      user: IUser & mongoose.Document
    }>("user", "username profileImage")

    return docs.map((d) => ({
      id: d.user._id.toString(),
      name: d.user.username,
      avatarUrl: d.user.profileImage,
    }))
  },

  async getFollowing(userId: string): Promise<Following[]> {
    if (!mongoose.isValidObjectId(userId))
      throw createError("Invalid user ID", 400)

    const docs = await Follow.find({ user: userId }).populate<{
      targetUser: IUser & mongoose.Document
    }>("targetUser", "username profileImage")

    return docs.map((d) => ({
      id: d.targetUser._id.toString(),
      name: d.targetUser.username,
      avatarUrl: d.targetUser.profileImage,
    }))
  },

  // ─── FRIEND REQUESTS ─────────────────────────────────
  async sendRequest(senderId: string, recipientId: string) {
    if (!mongoose.isValidObjectId(recipientId))
      throw createError("Invalid recipient ID", 400)

    if (senderId === recipientId)
      throw createError("Cannot friend yourself", 400)

    const exists = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    })
    if (exists) {
      throw createError("Request already exists", 400)
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
  },

  async acceptRequest(requestId: string, userId: string) {
    const reqDoc = await FriendRequest.findById(requestId)

    if (!reqDoc) {
      throw createError("Friend request not found", 404)
    }

    if (reqDoc.recipient._id.toString() !== userId) {
      throw createError("Not allowed", 403)
    }

    reqDoc.status = "accepted"
    await reqDoc.save()

    const other = reqDoc.sender.toString()
    await User.findByIdAndUpdate(userId, { $push: { friends: other } })
    await User.findByIdAndUpdate(other, { $push: { friends: userId } })

    // Create private chat
    await mongoose.model("Chat").create({
      participants: [userId, other],
      chatType: "private",
      messages: [],
    })

    await Notification.createNotification({
      user: new Types.ObjectId(other),
      sender: new Types.ObjectId(userId),
      message: `${userId} accepted your friend request.`,
      type: "friend_request",
      link: "/friends",
    })
  },

  async declineRequest(requestId: string, userId: string) {
    if (!mongoose.isValidObjectId(requestId))
      throw createError("Invalid request ID", 400)

    const reqDoc = await FriendRequest.findById(requestId)
    if (!reqDoc) {
      throw createError("Friend request not found", 404)
    }
    if (reqDoc.recipient._id.toString() !== userId)
      throw createError("Not allowed", 403)

    reqDoc.status = "declined"
    await reqDoc.save()

    await Notification.createNotification({
      user: new Types.ObjectId(reqDoc.sender.toString()),
      sender: new Types.ObjectId(userId),
      message: `${userId} declined your friend request.`,
      type: "friend_request",
      link: "/friends",
    })
  },

  async cancelRequest(requestId: string, userId: string): Promise<void> {
    if (!mongoose.isValidObjectId(requestId))
      throw createError("Invalid request ID", 400)

    const result = await FriendRequest.deleteOne({
      _id: requestId,
      sender: userId,
    })
    if (!result.deletedCount)
      throw createError("Request not found or not yours", 404)
  },

  async removeFriend(userId: string, friendId: string): Promise<void> {
    if (!mongoose.isValidObjectId(friendId))
      throw createError("Invalid friend ID", 400)

    const user = await User.findById(userId)
    const friend = await User.findById(friendId)
    if (!user || !friend) throw createError("User not found", 404)

    user.friends = user.friends.filter((id) => id.toString() !== friendId)
    friend.friends = friend.friends.filter((id) => id.toString() !== userId)
    await user.save()
    await friend.save()

    await Notification.createNotification({
      user: new Types.ObjectId(friendId),
      sender: new Types.ObjectId(userId),
      message: `${userId} removed you as a friend.`,
      type: "message",
      link: "/friends",
    })
  },

  async listFriends(userId: string) {
    if (!mongoose.isValidObjectId(userId))
      throw createError("Invalid user ID", 400)

    const user = await User.findById(userId).populate("friends")

    if (!user) {
      throw createError("User not found", 404)
    }

    const friends = []

    for (const friend of user.friends) {
      friends.push({
        ...friend.toObject(),
        profileImage: friend.profileImage
          ? await FileUploadService.generateSignedUrl(friend.profileImage)
          : undefined,
      })
    }

    return friends
  },

  async pendingRequests(userId: string) {
    if (!mongoose.isValidObjectId(userId))
      throw createError("Invalid user ID", 400)

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
  },

  async aiRecommendations(userId: string) {
    try {
      // Step 1: Get current user data
      const currentUser = await User.findById(userId)
        .select(
          "username email profileImage friends goals interests location preferences",
        )
        .lean()

      if (!currentUser) {
        throw createError("User not found", 404)
      }

      // Get current user's friend IDs as strings for exclusion
      const currentFriendIds = currentUser.friends.map((friend) =>
        friend._id.toString(),
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
            // Only include active users (check both fields for compatibility)
            $or: [{ isActive: { $ne: false } }, { active: { $ne: false } }],
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
                                            $literal:
                                              currentUser.interests || [],
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

                // Goal category similarity (30% weight)
                {
                  $multiply: [
                    {
                      $cond: {
                        if: {
                          $and: [
                            { $isArray: "$goals" },
                            {
                              $gt: [{ $size: { $ifNull: ["$goals", []] } }, 0],
                            },
                          ],
                        },
                        then: {
                          $cond: {
                            if: {
                              $gt: [
                                {
                                  $size: { $literal: currentUser.goals || [] },
                                },
                                0,
                              ],
                            },
                            then: {
                              $let: {
                                vars: {
                                  userGoalCategories: {
                                    $literal: (currentUser.goals || []).map(
                                      (g: any) => g.category,
                                    ),
                                  },
                                  candidateGoalCategories: {
                                    $map: {
                                      input: "$goals",
                                      as: "goal",
                                      in: "$$goal.category",
                                    },
                                  },
                                },
                                in: {
                                  $divide: [
                                    {
                                      $size: {
                                        $setIntersection: [
                                          "$$userGoalCategories",
                                          "$$candidateGoalCategories",
                                        ],
                                      },
                                    },
                                    {
                                      $max: [
                                        {
                                          $size: {
                                            $setUnion: [
                                              "$$userGoalCategories",
                                              "$$candidateGoalCategories",
                                            ],
                                          },
                                        },
                                        1,
                                      ],
                                    },
                                  ],
                                },
                              },
                            },
                            else: 0,
                          },
                        },
                        else: 0,
                      },
                    },
                    30,
                  ],
                },

                // Location proximity (20% weight)
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
                    20,
                  ],
                },

                // Mutual friends boost (10% weight)
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
                                          (
                                            id:
                                              | string
                                              | number
                                              | mongoose.mongo.BSON.ObjectId
                                              | Uint8Array<ArrayBufferLike>
                                              | mongoose.mongo.BSON.ObjectIdLike
                                              | undefined,
                                          ) => new Types.ObjectId(id),
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
                    10,
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

        // Only include users with some similarity (lowered for more results)
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
              $ifNull: [
                { $ifNull: ["$profileImage", "$profileImage"] },
                "/default-avatar.svg",
              ],
            },
            interests: { $ifNull: ["$interests", []] },
            mutualFriends: "$mutualFriendsCount",
            similarityScore: { $round: ["$similarityScore", 1] },
            bio: { $ifNull: ["$bio", ""] },
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
                                  "$interests",
                                  [
                                    "Fitness",
                                    "Running",
                                    "Yoga",
                                    "Swimming",
                                    "Cycling",
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
                                  "$interests",
                                  [
                                    "Programming",
                                    "Study",
                                    "Learning",
                                    "Reading",
                                    "Education",
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
                                  "$interests",
                                  [
                                    "Business",
                                    "Career",
                                    "Leadership",
                                    "Networking",
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
        // console.log("🔄 Adding random users to reach minimum recommendations");

        const additionalUsers = await User.find({
          _id: {
            $nin: [
              ...Array.from(excludedUserIds).map(
                (id) => new Types.ObjectId(id),
              ),
              ...recommendations.map((r) => new Types.ObjectId(r._id)),
            ],
          },
          $or: [{ isActive: { $ne: false } }, { active: { $ne: false } }],
          role: { $ne: "admin" }, // Exclude admins
        })
          .select("username email profileImage profileImage interests bio")
          .limit(5 - recommendations.length)
          .lean()

        // Format additional users to match recommendation structure
        const formattedAdditional = additionalUsers.map((user) => ({
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.username || user.email,
          email: user.email,
          username: user.username,
          profileImage:
            user.profileImage || user.profileImage || "/default-avatar.svg",
          interests: user.interests || [],
          mutualFriends: 0,
          similarityScore: 1,
          bio:
            user.bio ||
            `Hello! I'm ${user.username || "a new user"} looking to connect with others.`,
          category: "general",
        }))

        recommendations.push(...formattedAdditional)
      }

      // fetch signed URLs for profile images
      for (const rec of recommendations) {
        if (rec.profileImage && !rec.profileImage.startsWith("http")) {
          rec.profileImage = await FileUploadService.generateSignedUrl(
            rec.profileImage,
          )
        }
      }

      return recommendations
    } catch (error) {
      logger.error("❌ Error in aiRecommendations:", error)

      // Fallback to basic recommendations in case of error
      try {
        const fallbackUsers = (await User.find({
          _id: { $ne: userId },
          $or: [{ isActive: { $ne: false } }, { active: { $ne: false } }],
          role: { $ne: "admin" }, // Exclude admins
        })
          .select("username email profileImage profileImage interests bio")
          .limit(6)
          .lean()) as any[]

        const formattedFallbackUsers = fallbackUsers.map((user) => ({
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.username || user.email,
          email: user.email,
          username: user.username,
          profileImage:
            user.profileImage || user.profileImage || "/default-avatar.svg",
          interests: user.interests || [],
          mutualFriends: 0,
          similarityScore: 1,
          bio:
            user.bio ||
            `Hello! I'm ${user.username || "a new user"} looking to connect with others.`,
          category: "general",
        }))

        // fetch signed URLs for profile images
        for (const rec of formattedFallbackUsers) {
          if (rec.profileImage && !rec.profileImage.startsWith("http")) {
            rec.profileImage = await FileUploadService.generateSignedUrl(
              rec.profileImage,
            )
          }
        }

        return formattedFallbackUsers
      } catch (fallbackError) {
        console.error("❌ Error in fallback recommendations:", fallbackError)
        return []
      }
    }
  },
}

export default FriendService
