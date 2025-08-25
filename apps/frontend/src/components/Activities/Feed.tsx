"use client"

import React, { useEffect, useState } from "react"

import { fetchActivities } from "@/api/activity/activity-api"

import Post from "./Post"

/** The shape our UI needs */
export interface FeedPost {
  id: string
  title: string
  content: string
  author: string
  authorId?: string
  timestamp: string
  likes?: number
  comments?: number
}

/** The raw data returned by fetchActivities() */
interface RawActivity {
  _id: string
  type: string
  description?: string
  user: {
    _id: string
    name: string
  }
  createdAt: string
}

interface FeedProps {
  posts?: FeedPost[]
}

const Feed: React.FC<FeedProps> = ({ posts }) => {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(posts ?? [])
  const [loading, setLoading] = useState<boolean>(posts == null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // <-- Added explicit `: Promise<void>` return type
    async function loadActivities(): Promise<void> {
      setLoading(true)
      setError(null)

      try {
        // Safely coerce unknown API shape into RawActivity[]
        const raw = (await fetchActivities()) as unknown
        const activities = Array.isArray(raw) ? (raw as RawActivity[]) : []

        if (!isMounted) return

        const mapped: FeedPost[] = activities.map((activity) => ({
          id: activity._id,
          title: capitalize(activity.type),
          content: activity.description ?? "No details available.",
          author: activity.user.name,
          authorId: activity.user._id,
          timestamp: new Date(activity.createdAt).toLocaleString(),
          likes: 0,
          comments: 0,
        }))

        setFeedPosts(mapped)
      } catch (err) {
        console.error("Error fetching activities:", err)
        if (isMounted) {
          setError("Failed to load activities. Please try again.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (!posts) {
      loadActivities()
    }

    return () => {
      isMounted = false
    }
  }, [posts])

  if (loading)
    return <p className="text-center text-gray-400">Loading activities...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (feedPosts.length === 0) {
    return (
      <div data-testid="no-posts-message" className="text-center text-gray-400">
        No posts available
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-gray-900 p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-primary">
        Recent Activities
      </h2>
      {feedPosts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          title={post.title}
          content={post.content}
          author={post.author}
          timestamp={post.timestamp}
        />
      ))}
    </div>
  )
}

export default Feed

/** Capitalizes the first letter only */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
