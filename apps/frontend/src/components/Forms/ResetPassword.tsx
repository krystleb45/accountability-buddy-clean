// src/components/Forms/ResetPassword.tsx
"use client"
import { motion } from "motion/react"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

import { useResetPassword } from "@/hooks/useResetPassword"

import styles from "./ResetPassword.module.css"

const ResetPassword: React.FC = () => {
  const router = useRouter()
  const token = Array.isArray(router.query.token)
    ? router.query.token[0]
    : router.query.token

  const { loading, error, success, reset } = useResetPassword()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirm] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return alert("Missing reset token.")
    if (password !== confirmPassword) {
      return alert("Passwords must match.")
    }
    await reset(token, password)
  }

  // On success, redirect
  useEffect(() => {
    if (success) {
      setTimeout(() => router.push("/login"), 3000)
    }
  }, [success, router])

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className={styles.heading}>Reset Password</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} noValidate>
        {/* New password */}
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            minLength={8}
          />
        </div>
        {/* Confirm */}
        <div className={styles.field}>
          <label htmlFor="confirm" className={styles.label}>
            Confirm Password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirm(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </motion.div>
  )
}

export default ResetPassword
