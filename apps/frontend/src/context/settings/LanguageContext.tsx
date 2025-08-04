// src/context/settings/LanguageContext.tsx
"use client"

import type { ReactNode } from "react"

import React, { createContext, useCallback, useEffect, useState } from "react"
// Change this line to a named import, since your i18n module doesn’t have a default export:
import i18n from "@/config/i18n/i18n"

const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh", "ar"] as const
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

interface LanguageContextType {
  language: SupportedLanguage
  changeLanguage: (lng: SupportedLanguage) => void
  getSupportedLanguages: () => SupportedLanguage[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function useLanguage(): LanguageContextType {
  const ctx = use(LanguageContext)
  if (!ctx)
    throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}

function getInitialLanguage(): SupportedLanguage {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("language")
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage
    }
    const primary = navigator.language.split("-")[0] as SupportedLanguage
    if (SUPPORTED_LANGUAGES.includes(primary)) {
      return primary
    }
  }
  return "en"
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] =
    useState<SupportedLanguage>(getInitialLanguage)

  const changeLanguage = useCallback((lng: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(lng)) {
      console.warn(`Unsupported language: ${lng}`)
      return
    }
    i18n.changeLanguage(lng)
    setLanguage(lng)
    localStorage.setItem("language", lng)
  }, [])

  const getSupportedLanguages = useCallback(() => [...SUPPORTED_LANGUAGES], [])

  useEffect(() => {
    i18n.changeLanguage(language)
    localStorage.setItem("language", language)
  }, [language])

  return (
    <LanguageContext
      value={{ language, changeLanguage, getSupportedLanguages }}
    >
      {children}
    </LanguageContext>
  )
}

export default LanguageContext
