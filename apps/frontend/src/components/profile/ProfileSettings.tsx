// src/components/Profile/ProfileSettings.tsx
"use client"

import type { ChangeEvent, FormEvent } from "react"

import { motion } from "motion/react"
import React, { useState } from "react"

import styles from "./ProfileSettings.module.css"

interface User {
  name: string
  email: string
  bio?: string | undefined
  location?: string | undefined
  interests?: string[]
  profileImage?: string | undefined
  coverImage?: string | undefined
}

interface ProfileSettingsProps {
  user: User
  onUpdate: (
    updatedData: Partial<User> & { password?: string },
  ) => Promise<void>
}

interface FormFields {
  name: string
  email: string
  bio: string
  location: string
  interests: string
  profileImage: string
  coverImage: string
  password: string
  confirmPassword: string
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  onUpdate,
}) => {
  const [form, setForm] = useState<FormFields>({
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    location: user.location || "",
    interests: (user.interests || []).join(", "),
    profileImage: user.profileImage || "",
    coverImage: user.coverImage || "",
    password: "",
    confirmPassword: "",
  })
  const [coverPreview, setCoverPreview] = useState(form.coverImage)
  const [avatarPreview, setAvatarPreview] = useState(form.profileImage)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (!files?.[0]) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      setForm((f) => ({ ...f, [name]: url }))
      name === "coverImage" ? setCoverPreview(url) : setAvatarPreview(url)
    }
    reader.readAsDataURL(files[0])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (form.password && form.password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    try {
      // build payload
      const payload: Partial<User> & { password?: string } = {
        name: form.name,
        email: form.email,
        bio: form.bio || undefined,
        location: form.location || undefined,
        interests: form.interests
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        profileImage: form.profileImage || undefined,
        coverImage: form.coverImage || undefined,
      }
      if (form.password) payload.password = form.password

      await onUpdate(payload)
      setSuccess("Profile updated successfully!")
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }))
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError("Failed to update profile.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className={styles.settingsContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className={styles.header}>Profile Settings</h2>

      {/* Image Uploads */}
      <div className={styles.imageUploadContainer}>
        <label className={styles.uploadCard}>
          <img
            src={coverPreview || "/default-cover.png"}
            alt="Cover preview"
            className={styles.coverPreview}
          />
          <span className={styles.uploadLabel}>Change Cover</span>
          <input
            type="file"
            name="coverImage"
            accept="image/*"
            onChange={handleFile}
            className={styles.hiddenInput}
          />
        </label>

        <label className={styles.uploadCard}>
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt="Avatar preview"
            className={styles.avatarPreview}
          />
          <span className={styles.uploadLabel}>Change Avatar</span>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleFile}
            className={styles.hiddenInput}
          />
        </label>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          {/** Name */}
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={styles.inputField}
              required
            />
          </div>

          {/** Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={styles.inputField}
              required
            />
          </div>

          {/** Bio */}
          <div className={styles.formGroupFull}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={form.bio}
              onChange={handleChange}
              className={styles.textareaField}
            />
          </div>

          {/** Location */}
          <div className={styles.formGroup}>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>

          {/** Interests */}
          <div className={styles.formGroup}>
            <label htmlFor="interests">Interests</label>
            <input
              id="interests"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="Comma-separated"
              className={styles.inputField}
            />
          </div>

          {/** Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <motion.button
          type="submit"
          className={styles.updateButton}
          disabled={loading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? "Updating…" : "Update Profile"}
        </motion.button>
      </form>
    </motion.div>
  )
}

export default ProfileSettings
