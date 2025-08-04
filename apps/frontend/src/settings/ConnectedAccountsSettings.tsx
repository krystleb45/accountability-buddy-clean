import React, { useState } from "react"

import styles from "./ConnectedAccountsSettings.module.css"

const initial = {
  google: true,
  facebook: false,
}

type Providers = keyof typeof initial

const ConnectedAccountsSettings: React.FC = () => {
  const [linked, setLinked] = useState(initial)

  const toggle = (p: Providers) => {
    setLinked((l) => ({ ...l, [p]: !l[p] }))
    // TODO: call API to link/unlink
  }

  return (
    <div className={styles.container}>
      <h2>Connected Accounts</h2>
      <ul className={styles.list}>
        {(["google", "facebook"] as Providers[]).map((p) => (
          <li key={p} className={styles.item}>
            <span>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
            <button onClick={() => toggle(p)} className={styles.button}>
              {linked[p] ? "Unlink" : "Link"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ConnectedAccountsSettings
