// src/hooks/ui/useTheme.ts
"use client"

import { useCallback, useEffect, useState } from "react"

export type ThemeType = "light" | "dark" | "highContrast"

const themes: Record<ThemeType, Record<string, string>> = {
  light: {
    "--background-color": "#ffffff",
    "--text-color": "#000000",
    "--primary-color": "#1976d2",
  },
  dark: {
    "--background-color": "#121212",
    "--text-color": "#ffffff",
    "--primary-color": "#90caf9",
  },
  highContrast: {
    "--background-color": "#000000",
    "--text-color": "#ffcc00",
    "--primary-color": "#ff3300",
  },
}

function getInitialTheme(): ThemeType {
  if (typeof window === "undefined") return "light"
  const stored = localStorage.getItem("theme") as ThemeType | null
  if (stored && stored in themes) return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function useTheme(): { theme: ThemeType; toggleTheme: () => void } {
  const [theme, setTheme] = useState<ThemeType>(getInitialTheme)

  const applyTheme = useCallback((t: ThemeType) => {
    const vars = themes[t]
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeType =
        prev === "light" ? "dark" : prev === "dark" ? "highContrast" : "light"

      localStorage.setItem("theme", next)
      applyTheme(next)
      return next
    })
  }, [applyTheme])

  useEffect(() => {
    applyTheme(theme)

    // Sync with system preference if user hasn't explicitly chosen
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        const sysTheme: ThemeType = e.matches ? "dark" : "light"
        setTheme(sysTheme)
        applyTheme(sysTheme)
      }
    }
    mql.addEventListener("change", onChange)
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [theme, applyTheme])

  return { theme, toggleTheme }
}

export default useTheme
