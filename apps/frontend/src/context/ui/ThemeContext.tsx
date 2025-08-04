// src/context/ui/ThemeContext.tsx
"use client"

import type { ReactNode } from "react"

import React, { createContext, useCallback, useEffect, useState } from "react"

type ThemeType = "light" | "dark" | "highContrast"

interface ThemeContextType {
  theme: ThemeType
  toggleTheme: () => void
  setTheme: (theme: ThemeType) => void
}

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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme(): ThemeContextType {
  const ctx = use(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
  return ctx
}

// Safely read localStorage or fall back to system preference
function getInitialTheme(): ThemeType {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme") as ThemeType | null
    if (stored && stored in themes) {
      return stored
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    return mql.matches ? "dark" : "light"
  }
  return "light"
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeType>(getInitialTheme)

  // Apply CSS vars for a theme
  const applyVars = useCallback((t: ThemeType) => {
    const vars = themes[t]
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
  }, [])

  // setTheme: writes storage, applies vars, updates state
  const setTheme = useCallback(
    (t: ThemeType) => {
      localStorage.setItem("theme", t)
      applyVars(t)
      setThemeState(t)
    },
    [applyVars],
  )

  // toggle in L → D → HC → L
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next =
        prev === "light" ? "dark" : prev === "dark" ? "highContrast" : "light"
      localStorage.setItem("theme", next)
      applyVars(next)
      return next
    })
  }, [applyVars])

  // initialize and listen to OS changes
  useEffect(() => {
    applyVars(theme)

    if (typeof window === "undefined") return

    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e: MediaQueryListEvent) => {
      // only auto-switch if user hasn't explicitly set one
      if (!localStorage.getItem("theme")) {
        const sys = e.matches ? "dark" : "light"
        applyVars(sys)
        setThemeState(sys)
      }
    }
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [theme, applyVars])

  return (
    <ThemeContext value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext>
  )
}

export default ThemeProvider
