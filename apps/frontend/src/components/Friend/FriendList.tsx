"use client"

import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { FaUserCheck, FaUserPlus, FaUserTimes } from "react-icons/fa"

import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriendRequests,
  fetchFriends,
} from "@/api/friends/friend-api"

import styles from "./FriendList.module.css"

interface Friend {
  _id: string
  name: string
  email: string
  profilePicture?: string
}

interface FriendRequest {
  _id: string
  sender: Friend
}

const FriendList: React.FC = () => {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const router = useRouter()

  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    if (status !== "authenticated" || !userId) return

    const loadData = async (): Promise<void> => {
      setLoading(true)
      try {
        // fetch and map friends
        const friendsRaw = await fetchFriends(userId)
        const friendsList: Friend[] = friendsRaw.map((f) => {
          const friend: Friend = {
            _id: f.id,
            name: f.name,
            email: f.email ?? "",
          }
          if (f.profilePicture) {
            friend.profilePicture = f.profilePicture
          }
          return friend
        })
        setFriends(friendsList)

        // fetch and map requests
        const requestsRaw = await fetchFriendRequests(userId)
        const requestsList: FriendRequest[] = requestsRaw.map((r) => {
          const sender: Friend = {
            _id: r.sender.id,
            name: r.sender.name,
            email: r.sender.email ?? "",
          }
          if (r.sender.profilePicture) {
            sender.profilePicture = r.sender.profilePicture
          }
          return { _id: r.id, sender }
        })
        setPendingRequests(requestsList)
      } catch (err) {
        console.error("Error loading friends data:", err)
        setError("Failed to load friends data.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [status, userId])

  const handleAccept = useCallback(
    async (requestId: string) => {
      if (!userId) return
      try {
        await acceptFriendRequest(userId, requestId)
        setPendingRequests((prev) =>
          prev.filter((req) => req._id !== requestId),
        )
        const updatedRaw = await fetchFriends(userId)
        const updated: Friend[] = updatedRaw.map((f) => {
          const fr: Friend = {
            _id: f.id,
            name: f.name,
            email: f.email ?? "",
          }
          if (f.profilePicture) fr.profilePicture = f.profilePicture
          return fr
        })
        setFriends(updated)
      } catch (err) {
        console.error("Error accepting request:", err)
        setError("Could not accept request.")
      }
    },
    [userId],
  )

  const handleDecline = useCallback(
    async (requestId: string) => {
      if (!userId) return
      try {
        await declineFriendRequest(userId, requestId)
        setPendingRequests((prev) =>
          prev.filter((req) => req._id !== requestId),
        )
      } catch (err) {
        console.error("Error declining request:", err)
        setError("Could not decline request.")
      }
    },
    [userId],
  )

  const filteredFriends = useMemo(
    () =>
      friends.filter(
        (f) =>
          f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.email.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [friends, searchTerm],
  )

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Friends</h2>
        {pendingRequests.length > 0 && (
          <span className={styles.badge}>{pendingRequests.length}</span>
        )}
      </header>

      <input
        type="text"
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.search}
        aria-label="Search friends"
      />

      {error && <p className={styles.error}>{error}</p>}

      {pendingRequests.length > 0 && (
        <section className={styles.requestsSection}>
          <h3>Pending Requests</h3>
          <ul className={styles.list}>
            {pendingRequests.map((req) => (
              <li key={req._id} className={styles.listItem}>
                <div className={styles.profile}>
                  <img
                    src={req.sender.profilePicture ?? "/default-avatar.png"}
                    alt={`${req.sender.name}'s avatar`}
                    className={styles.avatar}
                  />
                  <span>{req.sender.name}</span>
                </div>
                <div className={styles.actions}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAccept(req._id)}
                    aria-label="Accept friend request"
                    className={styles.acceptButton}
                  >
                    <FaUserCheck />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDecline(req._id)}
                    aria-label="Decline friend request"
                    className={styles.declineButton}
                  >
                    <FaUserTimes />
                  </motion.button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className={styles.list}>
        {loading ? (
          <li>Loading...</li>
        ) : filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <motion.li
              key={friend._id}
              className={styles.listItem}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              onClick={() => router.push(`/chat/${friend._id}`)}
              aria-label={`Chat with ${friend.name}`}
            >
              <div className={styles.profile}>
                <img
                  src={friend.profilePicture ?? "/default-avatar.png"}
                  alt={`${friend.name}'s avatar`}
                  className={styles.avatar}
                />
                <span>{friend.name}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.chatButton}
                aria-label="Start chat"
              >
                <FaUserPlus />
              </motion.button>
            </motion.li>
          ))
        ) : (
          <li className={styles.empty}>No friends found.</li>
        )}
      </ul>
    </div>
  )
}

export default FriendList
