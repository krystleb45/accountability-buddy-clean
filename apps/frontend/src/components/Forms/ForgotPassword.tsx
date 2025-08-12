// src/components/Forms/ForgotPassword.tsx
"use client"

import type { FormEvent } from "react"

import { motion } from "motion/react"
import React from "react"

import { useForgotPassword } from "@/hooks/useForgotPassword"

import { validateEmail } from "../../utils/FormsUtils"
import styles from "./ForgotPassword.module.css"

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = React.useState("")
  const { loading, error, success, reset } = useForgotPassword()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      return // optionally set a local validation message
    }
    await reset(email)
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.heading}>Forgot Password</h2>
      {success && <p className={styles.success}>{success}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="you@example.com"
            required
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Sending…" : "Send Instructions"}
        </button>
      </form>
    </motion.div>
  )
}

export default ForgotPassword
