// src/config/i18n/i18n.ts
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      // …etc.
    },
  },
  // other languages…
}

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en", // when key is missing
  interpolation: {
    escapeValue: false, // React already protects from XSS
  },
  react: {
    useSuspense: false, // if you don’t want i18next to suspend
  },
})

export default i18n
