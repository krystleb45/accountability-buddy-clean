// src/components/Notifications/Notification.tsx
"use client"

import React, { useEffect, useState } from "react"

import styles from "./Notification.module.css"

export type NotificationType = "success" | "info" | "warning" | "error"

export interface NotificationProps {
  message: string
  type?: NotificationType
  duration?: number // in milliseconds
  onDismiss?: () => void
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type = "info",
  duration = 5000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState<boolean>(true)

  useEffect((): (() => void) => {
    const timerId = window.setTimeout((): void => {
      setVisible(false)
      onDismiss?.()
    }, duration)

    return (): void => {
      clearTimeout(timerId)
    }
  }, [duration, onDismiss])

  if (!visible) return null

  return (
    <div
      className={`
        ${styles.notification}
        ${styles[type]}
      `}
      role="alert"
      aria-live="assertive"
    >
      <p className={styles.message}>{message}</p>
      {onDismiss && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={(): void => {
            setVisible(false)
            onDismiss()
          }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default Notification
