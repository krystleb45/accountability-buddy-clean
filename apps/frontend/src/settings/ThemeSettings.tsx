// src/settings/ThemeSettings.tsx

import React, { useCallback, useEffect, useState } from "react"

import styles from "./ThemeSettings.module.css"

type Theme = "light" | "dark"

const ThemeSettings: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light" // SSR-safe
    const stored = localStorage.getItem("theme") as Theme | null
    return stored === "dark" ? "dark" : "light"
  })

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = useCallback((): void => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  return (
    <div className={styles.container}>
      <h2>Theme Settings</h2>
      <p>Choose between Light and Dark Mode.</p>
      <button
        onClick={toggleTheme}
        className={styles.themeToggleButton}
        aria-label={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        aria-pressed={theme === "dark"}
        type="button"
      >
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
    </div>
  )
}

export default ThemeSettings
