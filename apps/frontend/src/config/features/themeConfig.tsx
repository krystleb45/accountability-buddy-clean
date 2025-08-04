// config/features/themeConfig.tsx
"use client"

import type { Theme, ThemeOptions } from "@mui/material/styles"
import type { ReactNode } from "react"

import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles"
import React, { createContext, useEffect, useState } from "react"

/** The valid modes for our app theme */
export type ThemeMode = "light" | "dark" | "highContrast"

/** Simple palettes for each mode */
const palettes: Record<ThemeMode, ThemeOptions["palette"]> = {
  light: {
    mode: "light",
    primary: { main: "#1976d2", contrastText: "#fff" },
    secondary: { main: "#dc004e", contrastText: "#fff" },
    background: { default: "#f4f6f8", paper: "#fff" },
    text: { primary: "#000", secondary: "#555" },
  },
  dark: {
    mode: "dark",
    primary: { main: "#90caf9", contrastText: "#000" },
    secondary: { main: "#f48fb1", contrastText: "#000" },
    background: { default: "#121212", paper: "#1d1d1d" },
    text: { primary: "#fff", secondary: "#bbb" },
  },
  highContrast: {
    mode: "dark",
    primary: { main: "#ffcc00", contrastText: "#000" },
    secondary: { main: "#ff3300", contrastText: "#000" },
    background: { default: "#000", paper: "#000" },
    text: { primary: "#fff", secondary: "#ffcc00" },
  },
}

function makeAppTheme(mode: ThemeMode): Theme {
  const palette = palettes[mode]
  if (!palette) {
    throw new Error(`Invalid theme mode: ${mode}`)
  }
  const theme = createTheme({
    palette,
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      h1: { fontSize: "2.5rem", fontWeight: 700 },
      h2: { fontSize: "2rem", fontWeight: 600 },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
          },
        },
      },
    },
  })

  return responsiveFontSizes(theme)
}

const STORAGE_KEY = "appThemeMode"
const DEFAULT_MODE: ThemeMode = "light"

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return DEFAULT_MODE
  const m = localStorage.getItem(STORAGE_KEY)
  if (m === "dark" || m === "highContrast" || m === "light") {
    return m
  }
  return DEFAULT_MODE
}

/** Context & hook for toggling/applying theme */
interface ThemeContextType {
  mode: ThemeMode
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useAppTheme(): ThemeContextType {
  const c = use(ThemeContext)
  if (!c) {
    throw new Error("useAppTheme must be inside <CustomThemeProvider>")
  }
  return c
}

export const CustomThemeProvider: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(getStoredTheme())

  // write to localStorage whenever mode changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  const setMode = (m: ThemeMode) => {
    setModeState(m)
  }

  const toggleMode = () => {
    setModeState((prev) =>
      prev === "light" ? "dark" : prev === "dark" ? "highContrast" : "light",
    )
  }

  const theme = makeAppTheme(mode)

  return (
    <ThemeContext value={{ mode, toggleMode, setMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext>
  )
}
