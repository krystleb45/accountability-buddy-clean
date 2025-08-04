// src/components/Notifications/NotFoundPage.tsx
import Link from "next/link"
import React from "react"

import styles from "./NotFoundPage.module.css"

const NotFoundPage: React.FC = () => {
  return (
    <main
      className={styles.container}
      role="main"
      aria-labelledby="notfound-heading"
    >
      <h1 id="notfound-heading" className={styles.statusCode}>
        404
      </h1>
      <p className={styles.message}>
        Oops! The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <Link
        href="/"
        className={styles.backHome}
        aria-label="Go back to home page"
      >
        ← Back to Home
      </Link>
    </main>
  )
}

export default NotFoundPage
