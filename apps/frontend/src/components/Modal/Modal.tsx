"use client"

import type {
  MouseEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from "react"

import React, { useEffect, useRef } from "react"

import styles from "./Modal.module.css"

export interface ModalProps {
  title?: string
  children: ReactNode
  isVisible: boolean
  onClose: () => void
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  title,
  children,
  isVisible,
  onClose,
  className = "",
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect((): (() => void) => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKey)
    return (): void => {
      document.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  // Focus dialog when opened
  useEffect((): void => {
    if (isVisible && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [isVisible])

  if (!isVisible) return null

  // Close if backdrop clicked
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  // Close on Enter/Space when backdrop is focused
  const handleOverlayKey = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Enter" || e.key === " ") {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="button"
      aria-label="Close modal"
      tabIndex={0}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKey}
      data-testid="modal-overlay"
    >
      <div
        ref={dialogRef}
        className={`${styles.dialog} ${className}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        data-testid="modal"
      >
        {title && (
          <header className={styles.header}>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
          </header>
        )}

        <div className={styles.content}>{children}</div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className={styles.close}
          data-testid="close-button"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Modal
