import React, { useEffect, useState } from "react"

import styles from "./SecuritySettings.module.css"

interface TrustedDevice {
  id: string
  name: string
  lastUsed: string
}

const SecuritySettings: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("twoFactorEnabled") || "false"),
  )
  const [loginAlerts, setLoginAlerts] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("loginAlerts") || "true"),
  )
  const [devices, setDevices] = useState<TrustedDevice[]>([
    { id: "1", name: "Chrome on macOS", lastUsed: "2025-05-10 14:23" },
    { id: "2", name: "iPhone 12", lastUsed: "2025-05-09 21:45" },
  ])

  useEffect(() => {
    localStorage.setItem("twoFactorEnabled", JSON.stringify(twoFactorEnabled))
  }, [twoFactorEnabled])

  useEffect(() => {
    localStorage.setItem("loginAlerts", JSON.stringify(loginAlerts))
  }, [loginAlerts])

  const revokeDevice = (id: string): void => {
    setDevices((devs) => devs.filter((d) => d.id !== id))
    // TODO: call API to revoke trust
  }

  return (
    <div className={styles.container}>
      <h2>Security Settings</h2>

      <div className={styles.toggleRow}>
        <label>
          <input
            type="checkbox"
            checked={twoFactorEnabled}
            onChange={() => setTwoFactorEnabled((f) => !f)}
            aria-label="Enable Two-Factor Authentication"
          />
          Enable Two-Factor Authentication
        </label>
      </div>

      <div className={styles.toggleRow}>
        <label>
          <input
            type="checkbox"
            checked={loginAlerts}
            onChange={() => setLoginAlerts((f) => !f)}
            aria-label="Enable Login Alerts"
          />
          Enable Login Alerts
        </label>
      </div>

      <section className={styles.section}>
        <h3>Trusted Devices</h3>
        <ul className={styles.deviceList}>
          {devices.map((d) => (
            <li key={d.id} className={styles.deviceItem}>
              <span>
                {d.name} <small>(last used {d.lastUsed})</small>
              </span>
              <button
                className={styles.revokeButton}
                onClick={() => revokeDevice(d.id)}
              >
                Revoke
              </button>
            </li>
          ))}
          {devices.length === 0 && <p>No trusted devices.</p>}
        </ul>
      </section>
    </div>
  )
}

export default SecuritySettings
