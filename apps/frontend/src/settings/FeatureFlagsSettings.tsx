import React, { useState } from "react"

import styles from "./FeatureFlagsSettings.module.css"

const initialFlags = {
  newOnboardingFlow: false,
  enableChatv2: true,
  showAnalytics: process.env.NODE_ENV === "production",
}

type Flags = typeof initialFlags

const FeatureFlagsSettings: React.FC = () => {
  const [flags, setFlags] = useState<Flags>(initialFlags)

  const toggle = (key: keyof Flags) =>
    setFlags((f) => ({ ...f, [key]: !f[key] }))

  return (
    <div className={styles.container}>
      <h2>Feature Flags</h2>
      <ul className={styles.flagList}>
        {Object.entries(flags).map(([key, value]) => (
          <li key={key} className={styles.flagItem}>
            <label>
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggle(key as keyof Flags)}
              />
              {key}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FeatureFlagsSettings
