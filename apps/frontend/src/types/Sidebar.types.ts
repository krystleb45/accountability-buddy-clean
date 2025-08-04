// src/components/Sidebar/Sidebar.types.ts

import type React from "react"

/** Props for the main Sidebar component */
export interface SidebarProps {
  /** Controls visibility of the sidebar */
  isVisible: boolean
}

/** Props for each clickable item in the sidebar */
export interface SidebarItemProps {
  /** Label text to display */
  label: string
  /** Optional icon to render alongside the label */
  icon?: React.ReactNode
  /** Whether this item is currently active/selected */
  isActive?: boolean
  /** Click handler */
  onClick?: () => void
}

/** Props for the footer area of the sidebar */
export interface SidebarFooterProps {
  /** Called when the user toggles theme */
  onThemeToggle?: () => void
  /** Called when the user clicks logout */
  onLogout?: () => void
}
