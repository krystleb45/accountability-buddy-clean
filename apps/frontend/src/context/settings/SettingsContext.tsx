// src/context/settings/SettingsContext.tsx
"use client"

import type { ReactNode } from "react"

import React, { createContext, useCallback, useState } from "react"

const STORAGE_KEY = "appSettings"
const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh", "ar"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

interface Settings {
  darkMode: boolean
  notificationsEnabled: boolean
  language: SupportedLanguage
  autoSave: boolean
  saveFrequency: number
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  resetSettings: () => void
  toggleDarkMode: () => void
  enableNotifications: (enabled: boolean) => void
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
)

const defaultSettings: Settings = {
  darkMode: false,
  notificationsEnabled: true,
  language: "en",
  autoSave: false,
  saveFrequency: 10,
}

function getInitialSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>
      return sanitizeSettings({ ...defaultSettings, ...parsed })
    }
  } catch {
    /* ignore */
  }
  return defaultSettings
}

function sanitizeSettings(input: Settings): Settings {
  const out = { ...input }
  if (!SUPPORTED_LANGUAGES.includes(out.language as SupportedLanguage)) {
    out.language = defaultSettings.language
  }
  if (out.saveFrequency < 1 || out.saveFrequency > 60) {
    out.saveFrequency = defaultSettings.saveFrequency
  }
  return out
}

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(getInitialSettings)

  const persist = useCallback((s: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    return s
  }, [])

  const updateSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      setSettings((prev) => {
        const merged = sanitizeSettings({ ...prev, ...newSettings })
        return persist(merged)
      })
    },
    [persist],
  )

  const resetSettings = useCallback(() => {
    setSettings(persist(defaultSettings))
  }, [persist])

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => persist({ ...prev, darkMode: !prev.darkMode }))
  }, [persist])

  const enableNotifications = useCallback(
    (enabled: boolean) => {
      setSettings((prev) => persist({ ...prev, notificationsEnabled: enabled }))
    },
    [persist],
  )

  return (
    <SettingsContext
      value={{
        settings,
        updateSettings,
        resetSettings,
        toggleDarkMode,
        enableNotifications,
      }}
    >
      {children}
    </SettingsContext>
  )
}

export default SettingsContext
