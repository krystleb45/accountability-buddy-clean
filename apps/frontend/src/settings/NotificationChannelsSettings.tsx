import React, { useEffect, useState } from "react"

import styles from "./NotificationChannelsSettings.module.css"

const NotificationChannelsSettings: React.FC = () => {
  const [pushEnabled, setPushEnabled] = useState<boolean>(
    JSON.parse(localStorage.getItem("pushEnabled") || "true"),
  )
  const [inAppEnabled, setInAppEnabled] = useState<boolean>(
    JSON.parse(localStorage.getItem("inAppEnabled") || "true"),
  )
  const [quietHours, setQuietHours] = useState<{ start: string; end: string }>(
    () => {
      return {
        start: localStorage.getItem("quietStart") || "22:00",
        end: localStorage.getItem("quietEnd") || "07:00",
      }
    },
  )

  useEffect(() => {
    localStorage.setItem("pushEnabled", JSON.stringify(pushEnabled))
  }, [pushEnabled])
  useEffect(() => {
    localStorage.setItem("inAppEnabled", JSON.stringify(inAppEnabled))
  }, [inAppEnabled])
  useEffect(() => {
    localStorage.setItem("quietStart", quietHours.start)
    localStorage.setItem("quietEnd", quietHours.end)
  }, [quietHours])

  return (
    <div className={styles.container}>
      <h2>Notification Channels</h2>

      <label className={styles.row}>
        <input
          type="checkbox"
          checked={pushEnabled}
          onChange={() => setPushEnabled((f) => !f)}
        />
        Enable Push Notifications
      </label>

      <label className={styles.row}>
        <input
          type="checkbox"
          checked={inAppEnabled}
          onChange={() => setInAppEnabled((f) => !f)}
        />
        Enable In-App Notifications
      </label>

      <div className={styles.quietHours}>
        <h3>Quiet Hours</h3>
        <div className={styles.timeRow}>
          <label>
            From{" "}
            <input
              type="time"
              value={quietHours.start}
              onChange={(e) =>
                setQuietHours((q) => ({ ...q, start: e.target.value }))
              }
            />
          </label>
          <label>
            To{" "}
            <input
              type="time"
              value={quietHours.end}
              onChange={(e) =>
                setQuietHours((q) => ({ ...q, end: e.target.value }))
              }
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default NotificationChannelsSettings
