// src/components/Sidebar/Sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import styles from "./Sidebar.module.css"

interface SidebarProps {
  isVisible: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  const pathname = usePathname()

  if (!isVisible) return null

  const isActive = (path: string) => pathname === path

  return (
    <aside
      className={styles.sidebar}
      role="navigation"
      aria-label="Sidebar Navigation"
    >
      <ul className={styles.list}>
        <li className={styles.item}>
          <Link
            href="/"
            className={[styles.link, isActive("/") ? styles.active : ""].join(
              " ",
            )}
            aria-label="Dashboard"
          >
            Dashboard
          </Link>
        </li>
        <li className={styles.item}>
          <Link
            href="/goals"
            className={[
              styles.link,
              isActive("/goals") ? styles.active : "",
            ].join(" ")}
            aria-label="Goals"
          >
            Goals
          </Link>
        </li>
        <li className={styles.item}>
          <Link
            href="/collaborations"
            className={[
              styles.link,
              isActive("/collaborations") ? styles.active : "",
            ].join(" ")}
            aria-label="Collaborations"
          >
            Collaborations
          </Link>
        </li>
        <li className={styles.item}>
          <Link
            href="/profile"
            className={[
              styles.link,
              isActive("/profile") ? styles.active : "",
            ].join(" ")}
            aria-label="Profile"
          >
            Profile
          </Link>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
