"use client"

import type { KeyboardEvent as ReactKeyboardEvent } from "react"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useCallback, useState } from "react"
import {
  FaBars,
  FaCog,
  FaCommentDots,
  FaCreditCard,
  FaEnvelope,
  FaInfoCircle,
  FaQuestionCircle,
  FaShieldAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa"

import styles from "./Navbar.module.css"
import NavbarDropdown from "./NavbarDropdown"

// Handle sign out function using window location redirect
function handleSignOut() {
  // Alternative approach: redirect to NextAuth signout endpoint
  window.location.href = "/api/auth/signout"
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const router = useRouter()

  // Consolidated Account dropdown items
  const accountItems: Array<{
    label: string
    onClick?: () => void
    icon?: React.ReactNode
    className?: string
  }> = [
    // User Actions
    {
      label: "Profile",
      onClick: (): void => router.push("/profile"),
      icon: <FaUser className="size-4" />,
    },
    {
      label: "Settings",
      onClick: (): void => router.push("/settings"),
      icon: <FaCog className="size-4" />,
    },

    // Subscription Management - ADD THIS
    {
      label: "Subscription",
      onClick: (): void => router.push("/subscription"),
      icon: <FaCreditCard className="size-4" />,
    },

    // Divider (handled specially in dropdown)
    { label: "divider" as const },

    // Help & Support
    {
      label: "FAQ",
      onClick: () => router.push("/faq"),
      icon: <FaQuestionCircle className="size-4" />,
    },
    {
      label: "About Us",
      onClick: () => router.push("/about-us"),
      icon: <FaInfoCircle className="size-4" />,
    },
    {
      label: "Contact Support",
      onClick: () => router.push("/contact-support"),
      icon: <FaEnvelope className="size-4" />,
    },
    {
      label: "Feedback",
      onClick: () => router.push("/Feedback"),
      icon: <FaCommentDots className="size-4" />,
    },
    {
      label: "Privacy Policy",
      onClick: () => router.push("/privacy-policy"),
      icon: <FaShieldAlt className="size-4" />,
    },

    // Another divider
    { label: "divider" as const },

    // Logout
    {
      label: "Logout",
      onClick: (): void => {
        handleSignOut()
      },
      icon: <FaSignOutAlt className="size-4" />,
      className: "text-red-400 hover:text-red-300", // Special styling for logout
    },
  ]

  const toggleMenu = useCallback((): void => setIsMenuOpen((open) => !open), [])
  const closeMenu = useCallback((): void => setIsMenuOpen(false), [])

  // close mobile menu on Escape
  const handleMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (e.key === "Escape") closeMenu()
  }

  return (
    <nav className={styles.navbar} data-testid="navbar">
      {/* Brand always shown first */}
      <div className={styles.brand}>
        <Link
          href={session?.user ? "/dashboard" : "/"}
          className={styles.brandLink}
        >
          Accountability Buddy
        </Link>
      </div>

      {/* Mobile menu toggle */}
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <FaBars size={24} />
      </button>

      {/* Desktop links - simplified */}
      <div className={styles.links}>
        {/* Only show account-related items when logged in */}
        {session?.user && (
          <>{/* You can add other main navigation items here if needed */}</>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          className={styles.mobileMenu}
          role="menu"
          aria-label="Mobile navigation"
          tabIndex={0}
          onKeyDown={handleMenuKey}
        >
          {session?.user ? (
            // Show all account items in mobile menu
            accountItems
              .filter((item) => item.label !== "divider")
              .map((item, i) => (
                <button
                  key={i}
                  role="menuitem"
                  className={`${styles.mobileLink} ${item.className || ""}`}
                  onClick={() => {
                    item.onClick?.()
                    closeMenu()
                  }}
                >
                  <span className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </button>
              ))
          ) : (
            // Show basic links for non-authenticated users
            <Link
              href="/login"
              role="menuitem"
              className={styles.mobileLink}
              onClick={closeMenu}
            >
              Login
            </Link>
          )}
        </div>
      )}

      {/* User / Auth section */}
      <div className={styles.authSection}>
        {status === "loading" ? (
          <div className={styles.skeleton} data-testid="navbar-skeleton" />
        ) : session?.user ? (
          <NavbarDropdown
            title="Account"
            items={accountItems}
            className="enhanced-dropdown"
          />
        ) : (
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
        )}
      </div>

      {/* Welcome message - positioned absolutely in center */}
      {session?.user && (
        <span className={styles.welcome}>
          Welcome, {session.user.name || session.user.email?.split("@")[0]}!
        </span>
      )}
    </nav>
  )
}
