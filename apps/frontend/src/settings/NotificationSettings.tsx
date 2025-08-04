"use client"

import React, { useCallback } from "react"

import useLocalStorage from "@/hooks/state/useLocalStorage"

import styles from "./NotificationSettings.module.css"

const NotificationSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useLocalStorage<boolean>(
    "emailNotifications",
    true,
  )
  const [smsNotifications, setSmsNotifications] = useLocalStorage<boolean>(
    "smsNotifications",
    false,
  )

  const toggleEmail = useCallback(
    () => setEmailNotifications((v) => !v),
    [setEmailNotifications],
  )
  const toggleSms = useCallback(
    () => setSmsNotifications((v) => !v),
    [setSmsNotifications],
  )

  return (
    <div className={styles.container}>
      <h2>Notification Settings</h2>
      <p>Customize your notification preferences.</p>

      <div className={styles.setting}>
        <label htmlFor="email-toggle" className={styles.toggleLabel}>
          <input
            id="email-toggle"
            type="checkbox"
            role="switch"
            aria-checked={emailNotifications}
            onChange={toggleEmail}
            className={styles.hiddenCheckbox}
          />
          <span className={styles.customCheckbox}>
            {emailNotifications && "✔️"}
          </span>
          Enable Email Notifications
        </label>
      </div>

      <div className={styles.setting}>
        <label htmlFor="sms-toggle" className={styles.toggleLabel}>
          <input
            id="sms-toggle"
            type="checkbox"
            role="switch"
            aria-checked={smsNotifications}
            onChange={toggleSms}
            className={styles.hiddenCheckbox}
          />
          <span className={styles.customCheckbox}>
            {smsNotifications && "✔️"}
          </span>
          Enable SMS Notifications
        </label>
      </div>
    </div>
  )
}

export default NotificationSettings
