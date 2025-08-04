"use client"

import React from "react"

import { useTheme } from "@/context/ui/ThemeContext"

import styles from "./ThemeToggle.module.css"

/**
 * A button to toggle between light and dark themes.
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const isDarkMode = theme === "dark"

  return (
    <div className={styles.container} data-testid="theme-toggle">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        aria-pressed={isDarkMode}
        className={`${styles.button} ${isDarkMode ? styles.dark : styles.light}`}
        data-testid="theme-toggle-button"
      >
        <span className={styles.icon} aria-hidden="true">
          {isDarkMode ? "🌙" : "☀️"}
        </span>
        <span className={styles.label}>
          {isDarkMode ? "Dark Mode" : "Light Mode"}
        </span>
      </button>
    </div>
  )
}

export default ThemeToggle
