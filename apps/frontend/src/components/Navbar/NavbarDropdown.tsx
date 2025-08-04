// src/components/Navbar/NavbarDropdown.tsx
"use client"

import type { KeyboardEvent as ReactKeyboardEvent } from "react"

import React, { useEffect, useRef, useState } from "react"
import { FaChevronDown } from "react-icons/fa"

import styles from "./NavbarDropdown.module.css"

export interface NavbarDropdownItem {
  label: string
  onClick?: () => void // Made optional to handle dividers
  icon?: React.ReactNode // Added for icons
  className?: string // Added for custom styling
}

export interface NavbarDropdownProps {
  title: string
  items: NavbarDropdownItem[]
  className?: string // Added for wrapper styling
}

export default function NavbarDropdown({
  title,
  items,
  className = "",
}: NavbarDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape key
  useEffect((): (() => void) => {
    const handleClickOutside = (e: Event): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const handleGlobalKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleGlobalKey)
    return (): void => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleGlobalKey)
    }
  }, [])

  const toggleOpen = (): void => {
    setIsOpen((open) => !open)
  }

  const handleButtonKeyDown = (
    e: ReactKeyboardEvent<HTMLButtonElement>,
  ): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleOpen()
    }
  }

  const handleItemSelect = (onClick?: () => void): void => {
    setIsOpen(false)
    if (onClick) {
      onClick()
    }
  }

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      <button
        type="button"
        className={styles.toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={toggleOpen}
        onKeyDown={handleButtonKeyDown}
      >
        <span className={styles.toggleText}>{title}</span>
        <FaChevronDown
          className={`${styles.toggleIcon} ${isOpen ? styles.toggleIconOpen : ""}`}
        />
      </button>

      {isOpen && (
        <ul role="menu" className={styles.menu}>
          {items.map((item, idx) => {
            // Handle dividers
            if (item.label === "divider") {
              return (
                <li
                  key={`divider-${idx}`}
                  role="none"
                  className={styles.divider}
                >
                  <hr className={styles.dividerLine} />
                </li>
              )
            }

            return (
              <li key={idx} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.menuItem} ${item.className || ""}`}
                  onClick={(): void => handleItemSelect(item.onClick)}
                  onKeyDown={(
                    e: ReactKeyboardEvent<HTMLButtonElement>,
                  ): void => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleItemSelect(item.onClick)
                    }
                  }}
                >
                  {item.icon && (
                    <span className={styles.menuItemIcon}>{item.icon}</span>
                  )}
                  <span className={styles.menuItemText}>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
