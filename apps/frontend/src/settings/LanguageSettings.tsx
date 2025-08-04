import React, { useEffect, useState } from "react"

import styles from "./LanguageSettings.module.css"

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
]

const LanguageSettings: React.FC = () => {
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("language") ||
      navigator.language.split("-")[0] ||
      "en",
  )

  useEffect(() => {
    localStorage.setItem("language", language)
    document.documentElement.lang = language
  }, [language])

  return (
    <div className={styles.container}>
      <h2>Language Settings</h2>
      <select
        className={styles.selectBox}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Select language"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LanguageSettings
