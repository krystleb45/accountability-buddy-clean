// src/settings/PrivacySettings.tsx
"use client"

import type { ChangeEvent } from "react"

import React, { useEffect, useState } from "react"

import styles from "./PrivacySettings.module.css"

// Narrow the visibility options into a proper union type
type ProfileVisibility = "public" | "friends-only" | "private"

const PrivacySettings: React.FC = () => {
  // On SSR window is undefined, so default to 'public' until `useEffect` runs
  const [profileVisibility, setProfileVisibility] =
    useState<ProfileVisibility>("public")

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(
        "profileVisibility",
      ) as ProfileVisibility | null
      if (
        stored === "public" ||
        stored === "friends-only" ||
        stored === "private"
      ) {
        setProfileVisibility(stored)
      }
    }
  }, [])

  // Persist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("profileVisibility", profileVisibility)
    }
  }, [profileVisibility])

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setProfileVisibility(e.target.value as ProfileVisibility)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Privacy Settings</h2>
      <p className={styles.intro}>
        Control who can see your profile and personal data.
      </p>

      <div className={styles.setting}>
        <label htmlFor="visibilitySelect" className={styles.label}>
          Profile Visibility:
        </label>
        <select
          id="visibilitySelect"
          value={profileVisibility}
          onChange={handleChange}
          className={styles.selectBox}
          aria-describedby="visibilityHelp"
        >
          <option value="public">Public – Anyone can view</option>
          <option value="friends-only">
            Friends Only – Only your connections
          </option>
          <option value="private">Private – Only you can see</option>
        </select>
        <p id="visibilityHelp" className={styles.helpText}>
          {profileVisibility === "public" &&
            "Your profile is visible to everyone."}
          {profileVisibility === "friends-only" &&
            "Your profile is only visible to your connections."}
          {profileVisibility === "private" &&
            "Your profile is completely private."}
        </p>
      </div>
    </div>
  )
}

export default PrivacySettings
