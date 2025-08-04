// src/components/Sidebar/SidebarItem.tsx
import React from "react"

import styles from "./SidebarItem.module.css"

interface SidebarItemProps {
  label: string
  icon?: React.ReactNode
  isActive?: boolean
  onClick?: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  isActive = false,
  onClick,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!onClick) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </div>
  )
}

export default SidebarItem
