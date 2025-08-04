"use client"

import type { ReactNode } from "react"

import React from "react"

import styles from "./ErrorBoundary.module.css"

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackMessage?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    // Update state to show fallback UI
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Save error details
    this.setState({ error, errorInfo })
    console.error("🛑 ErrorBoundary caught an error:", error, errorInfo)
    // TODO: send to external logging service (Sentry, LogRocket, etc.)
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallbackMessage } = this.props

    if (hasError) {
      return (
        <div
          className={styles.fallback}
          role="alert"
          aria-live="assertive"
          data-testid="error-boundary"
        >
          <h1 className={styles.title}>
            {fallbackMessage ?? "Something went wrong."}
          </h1>
          <p className={styles.message}>
            We&apos;re working to fix the issue. Please try again later.
          </p>

          {process.env.NODE_ENV === "development" && errorInfo && (
            <details className={styles.details}>
              <summary>Error Details</summary>
              <pre className={styles.stack}>{error?.toString()}</pre>
              <pre className={styles.stack}>{errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      )
    }

    return children
  }
}

export default ErrorBoundary
