"use client"

import { motion } from "framer-motion"
import React, { useCallback, useState } from "react"

import { validateEmail } from "../../utils/FormsUtils"
import styles from "./NewsletterSignup.module.css"

/**
 * Props for NewsletterSignup component.
 */
export interface NewsletterSignupProps {
  /** Callback invoked when form is submitted with valid data */
  onSubmit: (data: { email: string; consent: boolean }) => void
}

/**
 * NewsletterSignup renders a subscription form with email validation and consent.
 */
const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState<string>("")
  const [consent, setConsent] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  /**
   * Handles form submission: validation and invoking onSubmit.
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setErrorMessage("")
      setSuccessMessage("")
      setLoading(true)

      if (!validateEmail(email)) {
        setErrorMessage("Please enter a valid email address.")
        setLoading(false)
        return
      }
      if (!consent) {
        setErrorMessage("You must agree to receive newsletters.")
        setLoading(false)
        return
      }

      try {
        onSubmit({ email, consent })
        setSuccessMessage("Thank you for subscribing!")
        setEmail("")
        setConsent(false)
      } catch (err) {
        console.error("Newsletter signup error:", err)
        setErrorMessage("Failed to subscribe. Please try again later.")
      } finally {
        setLoading(false)
      }
    },
    [email, consent, onSubmit],
  )

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className={styles.heading}>Subscribe to our Newsletter</h3>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="you@example.com"
            aria-required="true"
            required
          />
        </div>
        <div className={styles.fieldCheckbox}>
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={consent}
            onChange={() => setConsent((prev) => !prev)}
            className={styles.checkbox}
            aria-required="true"
          />
          <label htmlFor="consent" className={styles.checkboxLabel}>
            I agree to receive newsletters
          </label>
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={loading || !email || !consent}
          aria-busy={loading}
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {successMessage && (
        <p className={styles.success} role="status">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </motion.div>
  )
}

export default NewsletterSignup
