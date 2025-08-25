import type { ReactNode } from "react"

import React, { Component } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: "",
    }
  }

  /**
   * Update state when an error occurs, to display fallback UI.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, errorMessage: error.message }
  }

  /**
   * Log the error details for debugging purposes.
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("🔥 Error caught by ErrorBoundary:", error, errorInfo)
    // Optionally, send the error details to a logging service (e.g., Sentry)
  }

  /**
   * Reset the error state to allow users to recover without refreshing.
   */
  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: "" })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className={`
            flex min-h-screen items-center justify-center bg-black text-white
          `}
        >
          <div className="w-96 rounded-lg bg-gray-900 p-6 text-center shadow-lg">
            <h1 className="mb-4 text-2xl font-bold text-red-500">
              Oops! Something went wrong.
            </h1>
            <p className="mb-6 text-gray-300" aria-live="assertive">
              {this.state.errorMessage ||
                "An unexpected error occurred. Please try again."}
            </p>
            <button
              onClick={this.handleRetry}
              className={`
                rounded-lg bg-primary px-4 py-2 font-semibold text-black
                transition
                hover:bg-green-400
              `}
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
