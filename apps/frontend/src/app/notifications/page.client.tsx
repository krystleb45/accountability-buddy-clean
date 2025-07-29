// src/app/notifications/page.client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  fetchNotifications,
  markNotificationsRead,
  type Notification,
} from '@/api/notifications/notificationApi'
import { Skeleton } from '@/components/UtilityComponents/SkeletonComponent'

const FILTER_TYPES = ['all', 'unread', 'read'] as const
type FilterType = typeof FILTER_TYPES[number]

export default function NotificationsClient() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await fetchNotifications()
        setNotifications(data)
      } catch {
        setError('Failed to load notifications.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'read')   return n.read
    return true
  })

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    const updatedCount = await markNotificationsRead(unreadIds)
    if (updatedCount > 0) {
      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id) ? { ...n, read: true } : n
        )
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="mb-4 h-16 rounded-lg bg-gray-700" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-500 mt-6">{error}</p>
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex items-center justify-between rounded-lg bg-gray-900 p-6 shadow-md"
      >
        <h1 className="text-3xl font-bold text-kelly-green">Notifications</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-gray-400 hover:underline"
          >
            Mark all read
          </button>
          <Link href="/dashboard" passHref>
            <span className="font-semibold text-kelly-green hover:underline">
              Dashboard
            </span>
          </Link>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-6 rounded-lg bg-gray-900 p-4 shadow-md"
      >
        {FILTER_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`mr-2 rounded-lg px-4 py-2 transition ${
              filter === type
                ? 'bg-kelly-green text-black'
                : 'bg-gray-700 text-white'
            }`}
            aria-label={`Show ${type} notifications`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </motion.div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="rounded-lg bg-gray-900 p-6 shadow-md"
      >
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`mb-4 rounded-lg p-4 shadow-md transition-colors ${
                n.read ? 'bg-gray-700' : 'bg-gray-900'
              }`}
            >
              <div className="flex justify-between">
                <p className="text-white">{n.message}</p>
                <span className="text-sm text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-400">No notifications to show.</p>
        )}
      </motion.main>
    </div>
  )
}
